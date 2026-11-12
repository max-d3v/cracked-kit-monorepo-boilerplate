import { deleteAllByUserId as deleteAllSubscriptionsByUserId } from "@workspace/repository/entities/subscription";
import { deleteAllByUserId as deleteAllTasksByUserId } from "@workspace/repository/entities/tasks";
import {
  deleteOne as deleteUser,
  get,
  updateOne as updateUser,
} from "@workspace/repository/entities/users";
import { HttpError } from "@workspace/types/errors/http";
import { describe, expect, it, vi } from "vitest";
import { deleteAccount, getUser, updateProfile } from "../src/use-cases/users";
import { makeUser, USER_ID } from "./fixtures";

vi.mock("@workspace/repository/entities/users", () => ({
  deleteOne: vi.fn(),
  get: vi.fn(),
  updateOne: vi.fn(),
}));
vi.mock("@workspace/repository/entities/tasks", () => ({
  deleteAllByUserId: vi.fn(),
}));
vi.mock("@workspace/repository/entities/subscription", () => ({
  deleteAllByUserId: vi.fn(),
}));

describe("getUser", () => {
  it("returns only the public auth fields", async () => {
    vi.mocked(get).mockResolvedValue(makeUser({ image: "https://img" }));

    await expect(getUser({ id: USER_ID })).resolves.toEqual({
      id: USER_ID,
      email: "ada@example.com",
      name: "Ada Lovelace",
      image: "https://img",
      emailVerified: true,
    });
    expect(get).toHaveBeenCalledWith({ id: USER_ID });
  });

  it("surfaces not-found errors from the repository", async () => {
    vi.mocked(get).mockRejectedValue(new HttpError(404, "User not found"));

    await expect(getUser({ id: "missing" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("updateProfile", () => {
  it("renames the user and returns the updated profile", async () => {
    vi.mocked(updateUser).mockResolvedValue(makeUser({ name: "Ada King" }));

    const result = await updateProfile({ userId: USER_ID, name: "Ada King" });

    expect(updateUser).toHaveBeenCalledWith({ id: USER_ID, name: "Ada King" });
    expect(result).toEqual({
      id: USER_ID,
      email: "ada@example.com",
      name: "Ada King",
      image: null,
      emailVerified: true,
    });
  });
});

describe("deleteAccount", () => {
  it("removes the user's tasks and subscription before the user", async () => {
    vi.mocked(deleteUser).mockResolvedValue(makeUser());

    await expect(deleteAccount({ userId: USER_ID })).resolves.toEqual({
      deleted: true,
    });

    expect(deleteAllTasksByUserId).toHaveBeenCalledWith({ userId: USER_ID });
    expect(deleteAllSubscriptionsByUserId).toHaveBeenCalledWith({
      userId: USER_ID,
    });
    expect(deleteUser).toHaveBeenCalledWith({ id: USER_ID });

    const [userDeletedAt] = vi.mocked(deleteUser).mock.invocationCallOrder;
    const [tasksDeletedAt] = vi.mocked(deleteAllTasksByUserId).mock
      .invocationCallOrder;
    const [subscriptionDeletedAt] = vi.mocked(deleteAllSubscriptionsByUserId)
      .mock.invocationCallOrder;
    expect(tasksDeletedAt).toBeLessThan(userDeletedAt ?? 0);
    expect(subscriptionDeletedAt).toBeLessThan(userDeletedAt ?? 0);
  });

  it("does not delete the user if cleaning up their data fails", async () => {
    vi.mocked(deleteAllTasksByUserId).mockRejectedValue(new Error("db down"));

    await expect(deleteAccount({ userId: USER_ID })).rejects.toThrow("db down");
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
