import { captureException } from "@workspace/observability/server";
import { notFound } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { withRouteErrorHandling } from "@/lib/route-error-handler";

vi.mock("@workspace/observability/server", () => ({
  captureException: vi.fn(),
}));

const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

const request = () =>
  new Request("https://app.example.com/api/things", { method: "POST" });

const failingWith = (error: unknown) => () => {
  throw error;
};

describe("withRouteErrorHandling", () => {
  it("returns the handler's response when nothing goes wrong", async () => {
    const response = Response.json({ ok: true });
    const handler = withRouteErrorHandling(() => response, { route: "/api" });

    await expect(handler(request(), undefined)).resolves.toBe(response);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("turns unexpected errors into a 500 and reports them", async () => {
    const error = new Error("db down");
    const handler = withRouteErrorHandling(failingWith(error), {
      route: "/api/things",
      tags: { team: "core" },
    });

    const response = await handler(request(), undefined);

    expect(response.status).toBe(INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({ error: "db down" });
    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { boundary: "route-handler", route: "/api/things", team: "core" },
      extra: { method: "POST", url: "https://app.example.com/api/things" },
    });
  });

  it("uses a generic message for non-Error throws", async () => {
    const handler = withRouteErrorHandling(failingWith("oops"), {
      route: "/api",
    });

    const response = await handler(request(), undefined);

    await expect(response.json()).resolves.toEqual({
      error: "Unexpected route error",
    });
  });

  it("does not report client errors (< 500)", async () => {
    const handler = withRouteErrorHandling(failingWith(new Error("bad")), {
      route: "/api",
      getErrorResponse: () => ({
        body: { error: "bad" },
        status: BAD_REQUEST,
      }),
    });

    const response = await handler(request(), undefined);

    expect(response.status).toBe(BAD_REQUEST);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("does not report 500s that are marked as expected", async () => {
    const handler = withRouteErrorHandling(failingWith(new Error("known")), {
      route: "/api",
      isExpectedError: () => true,
    });

    const response = await handler(request(), undefined);

    expect(response.status).toBe(INTERNAL_SERVER_ERROR);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("lets Next.js control-flow errors (notFound, redirect) through", async () => {
    const handler = withRouteErrorHandling(() => notFound(), {
      route: "/api",
    });

    await expect(handler(request(), undefined)).rejects.toThrow();
    expect(captureException).not.toHaveBeenCalled();
  });
});
