import { describe, expect, it, vi } from "vitest";
import { importWithEnv } from "../../../test-utils/import-with-env";
import { EVENTS } from "../src/structure/events";

const posthog = vi.hoisted(() => ({
  constructed: vi.fn(),
  capture: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("posthog-node", () => ({
  PostHog: class {
    capture = posthog.capture;

    constructor(...args: unknown[]) {
      posthog.constructed(...args);
    }
  },
}));

/** Keys are read when the module is evaluated, so re-import after stubbing. */
const loadServer = (env: Record<string, string> = {}) =>
  importWithEnv(env, () => import("../src/server"));

const event = {
  event: EVENTS.task_created,
  userId: "user_1",
  details: { title: "Write tests" },
};

describe("analytics capture", () => {
  it("is a safe no-op when PostHog is not configured", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { analytics, capture } = await loadServer();

    expect(analytics).toBeUndefined();
    expect(() => capture(event)).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
    expect(posthog.constructed).not.toHaveBeenCalled();
  });

  it("sends events to PostHog with the user as distinct id", async () => {
    const { capture } = await loadServer({
      NEXT_PUBLIC_POSTHOG_KEY: "phc_test",
      NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com",
    });

    capture(event);

    expect(posthog.constructed).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        host: "https://eu.i.posthog.com",
        // Serverless: flush every event immediately.
        flushAt: 1,
        flushInterval: 0,
      })
    );
    expect(posthog.capture).toHaveBeenCalledWith({
      event: "task_created",
      distinctId: "user_1",
      properties: { title: "Write tests" },
    });
  });
});
