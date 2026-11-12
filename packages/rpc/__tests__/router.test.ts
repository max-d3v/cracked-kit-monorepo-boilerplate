import { createRouterClient, ORPCError } from "@orpc/server";
import { EVENTS } from "@workspace/analytics/events";
import { capture } from "@workspace/analytics/server";
import { auth } from "@workspace/auth/auth";
import {
  createUserCheckoutSession,
  getSubscriptionStatus,
} from "@workspace/core/use-cases/billing";
import {
  createTask,
  deleteTask,
  getUserTasks,
  getUserTasksWithCount,
  updateTask,
} from "@workspace/core/use-cases/tasks";
import { deleteAccount, updateProfile } from "@workspace/core/use-cases/users";
import { captureException } from "@workspace/observability/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "../src/router";

vi.mock("@workspace/auth/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@workspace/analytics/server", () => ({ capture: vi.fn() }));
vi.mock("@workspace/observability/server", () => ({
  captureException: vi.fn(),
}));
vi.mock("@workspace/core/use-cases/tasks", () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getUserTasks: vi.fn(),
  getUserTasksWithCount: vi.fn(),
  updateTask: vi.fn(),
}));
vi.mock("@workspace/core/use-cases/billing", () => ({
  cancelUserSubscription: vi.fn(),
  createUserBillingPortalSession: vi.fn(),
  createUserCheckoutSession: vi.fn(),
  getSubscriptionStatus: vi.fn(),
}));
vi.mock("@workspace/core/use-cases/users", () => ({
  deleteAccount: vi.fn(),
  getUser: vi.fn(),
  updateProfile: vi.fn(),
}));

const USER_ID = "user_1";
const TASK_ID = "6f1c2a4e-8b3d-4c7a-9e2f-1a2b3c4d5e6f";

const headers = new Headers({ cookie: "better-auth.session_token=abc" });
const client = createRouterClient(router, { context: { headers } });

const signIn = () => {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: USER_ID, email: "ada@example.com" },
    session: { id: "session_1", userId: USER_ID },
  } as never);
};

const signOut = () => {
  vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
};

describe("authentication", () => {
  it("rejects requests without a session before reaching the use-case", async () => {
    signOut();

    await expect(client.tasks.getUserTasks()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(getUserTasks).not.toHaveBeenCalled();
  });

  it("resolves the session from the request headers", async () => {
    signIn();
    vi.mocked(getUserTasks).mockResolvedValue([]);

    await client.tasks.getUserTasks();

    expect(auth.api.getSession).toHaveBeenCalledWith({ headers });
  });
});

describe("tasks router", () => {
  beforeEach(signIn);

  it("scopes task listing to the signed-in user", async () => {
    vi.mocked(getUserTasksWithCount).mockResolvedValue({
      tasks: [],
      taskCounts: { todo: 0, inProgress: 0, completed: 0 },
    });

    const result = await client.tasks.getUserTasksWithCount();

    expect(getUserTasksWithCount).toHaveBeenCalledWith({ userId: USER_ID });
    expect(result.taskCounts).toEqual({ todo: 0, inProgress: 0, completed: 0 });
  });

  it("creates tasks for the signed-in user", async () => {
    await client.tasks.create({ title: "Write tests" });

    expect(createTask).toHaveBeenCalledWith({
      userId: USER_ID,
      title: "Write tests",
    });
  });

  it("rejects invalid input with BAD_REQUEST", async () => {
    await expect(client.tasks.create({ title: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(
      client.tasks.update({ id: "not-a-uuid", title: "x" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createTask).not.toHaveBeenCalled();
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("maps update input to the use-case shape", async () => {
    await client.tasks.update({
      id: TASK_ID,
      status: "completed",
      dueDate: new Date("2026-03-01T00:00:00.000Z"),
    });

    expect(updateTask).toHaveBeenCalledWith({
      userId: USER_ID,
      taskId: TASK_ID,
      data: {
        status: "completed",
        dueDate: new Date("2026-03-01T00:00:00.000Z"),
      },
    });
  });

  it("deletes tasks scoped to the signed-in user", async () => {
    await client.tasks.delete({ id: TASK_ID });

    expect(deleteTask).toHaveBeenCalledWith({
      userId: USER_ID,
      taskId: TASK_ID,
    });
  });
});

describe("billing router", () => {
  beforeEach(signIn);

  it("returns the signed-in user's subscription status", async () => {
    vi.mocked(getSubscriptionStatus).mockResolvedValue({
      subscription: null,
      plan: "free",
    });

    await expect(client.billing.getSubscription()).resolves.toEqual({
      subscription: null,
      plan: "free",
    });
    expect(getSubscriptionStatus).toHaveBeenCalledWith({ userId: USER_ID });
  });

  it("starts checkout with the session user's email", async () => {
    vi.mocked(createUserCheckoutSession).mockResolvedValue({
      url: "https://checkout",
      sessionId: "cs_1",
    });

    await client.billing.createCheckoutSession({ priceId: "price_test_pro" });

    expect(createUserCheckoutSession).toHaveBeenCalledWith({
      userId: USER_ID,
      email: "ada@example.com",
      priceId: "price_test_pro",
    });
  });
});

describe("users router", () => {
  beforeEach(signIn);

  it("updates the signed-in user's profile", async () => {
    await client.users.updateProfile({ name: "Ada King" });

    expect(updateProfile).toHaveBeenCalledWith({
      userId: USER_ID,
      name: "Ada King",
    });
  });

  it("only deletes the signed-in user's account", async () => {
    vi.mocked(deleteAccount).mockResolvedValue({ deleted: true });

    await expect(client.users.deleteAccount()).resolves.toEqual({
      deleted: true,
    });
    expect(deleteAccount).toHaveBeenCalledWith({ userId: USER_ID });
  });
});

describe("error middleware", () => {
  beforeEach(signIn);

  it("reports unexpected errors to error tracking and rethrows them", async () => {
    const failure = new Error("connection refused");
    vi.mocked(getUserTasks).mockRejectedValue(failure);

    await expect(client.tasks.getUserTasks()).rejects.toBe(failure);
    expect(captureException).toHaveBeenCalledWith(failure);
    expect(capture).not.toHaveBeenCalled();
  });

  it("tracks expected (defined) errors as analytics events instead", async () => {
    vi.mocked(getUserTasks).mockRejectedValue(
      new ORPCError("EXPECTED_ERROR_DEMO", {
        defined: true,
        message: "Expected failure",
      })
    );

    await expect(client.tasks.getUserTasks()).rejects.toMatchObject({
      code: "EXPECTED_ERROR_DEMO",
    });
    expect(capture).toHaveBeenCalledWith({
      event: EVENTS.expected_error,
      userId: "anonymous",
      details: { code: "EXPECTED_ERROR_DEMO", message: "Expected failure" },
    });
    expect(captureException).not.toHaveBeenCalled();
  });
});
