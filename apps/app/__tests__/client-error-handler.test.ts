import { ORPCError } from "@orpc/server";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAppMutationCache,
  createAppQueryCache,
} from "@/lib/client-error-handler";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

type Meta = Record<string, unknown>;

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    queryCache: createAppQueryCache(),
    mutationCache: createAppMutationCache(),
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});

const failQuery = async (error: unknown, meta?: Meta) => {
  await queryClient
    .fetchQuery({
      queryKey: ["failing", Math.random()],
      queryFn: () => Promise.reject(error),
      meta,
    })
    .catch(() => undefined);
};

const failMutation = async (error: unknown, meta?: Meta) => {
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: () => Promise.reject(error),
    meta,
  });
  await mutation.execute(undefined).catch(() => undefined);
};

const notFound = () =>
  new ORPCError("NOT_FOUND", { message: "Task not found" });

describe("global query error handling", () => {
  it("toasts the server message for oRPC errors", async () => {
    await failQuery(notFound());

    expect(toast.error).toHaveBeenCalledWith("Task not found");
  });

  it("uses meta.errorTitle as the toast title", async () => {
    await failQuery(notFound(), { errorTitle: "Failed to load tasks" });

    expect(toast.error).toHaveBeenCalledWith("Failed to load tasks", {
      description: "Task not found",
    });
  });

  it("stays quiet when meta.silent is set", async () => {
    await failQuery(notFound(), { silent: true });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("hides non-oRPC error details behind a generic message", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const internal = new Error("TypeError: cannot read 'id' of undefined");

    await failQuery(internal);

    expect(toast.error).toHaveBeenCalledWith("Unexpected error");
    expect(consoleError).toHaveBeenCalledWith(internal);
  });
});

describe("global mutation error handling", () => {
  it("toasts mutation failures the same way", async () => {
    await failMutation(notFound(), { errorTitle: "Failed to delete task" });

    expect(toast.error).toHaveBeenCalledWith("Failed to delete task", {
      description: "Task not found",
    });
  });

  it("stays quiet for silent mutations", async () => {
    await failMutation(notFound(), { silent: true });

    expect(toast.error).not.toHaveBeenCalled();
  });
});
