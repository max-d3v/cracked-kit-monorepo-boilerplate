import { describe, expect, it } from "vitest";
import { TASK_ID } from "../../../test-utils/ids";
import { createCheckoutSessionInputSchema } from "../src/use-cases/billing";
import { stripeWebhookInputSchema } from "../src/use-cases/payments";
import {
  createTaskInputSchema,
  deleteTaskInputSchema,
  updateTaskInputSchema,
} from "../src/use-cases/tasks";
import { updateProfileInputSchema } from "../src/use-cases/users";

describe("createTaskInputSchema", () => {
  it("accepts a title with optional description", () => {
    expect(createTaskInputSchema.parse({ title: "Write tests" })).toEqual({
      title: "Write tests",
    });
    expect(
      createTaskInputSchema.parse({ title: "Write tests", description: null })
    ).toEqual({ title: "Write tests", description: null });
  });

  it("rejects an empty or missing title", () => {
    expect(createTaskInputSchema.safeParse({ title: "" }).success).toBe(false);
    expect(createTaskInputSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateTaskInputSchema", () => {
  it("requires a uuid id", () => {
    expect(updateTaskInputSchema.safeParse({ id: "not-a-uuid" }).success).toBe(
      false
    );
    expect(updateTaskInputSchema.safeParse({ id: TASK_ID }).success).toBe(true);
  });

  it("only allows known statuses", () => {
    for (const status of ["todo", "in-progress", "completed", "cancelled"]) {
      expect(
        updateTaskInputSchema.safeParse({ id: TASK_ID, status }).success
      ).toBe(true);
    }
    expect(
      updateTaskInputSchema.safeParse({ id: TASK_ID, status: "done" }).success
    ).toBe(false);
  });

  it("coerces date strings into Date objects", () => {
    const parsed = updateTaskInputSchema.parse({
      id: TASK_ID,
      dueDate: "2026-01-15T00:00:00.000Z",
    });

    expect(parsed.dueDate).toBeInstanceOf(Date);
    expect(parsed.dueDate?.toISOString()).toBe("2026-01-15T00:00:00.000Z");
  });

  it("rejects an empty title when one is provided", () => {
    expect(
      updateTaskInputSchema.safeParse({ id: TASK_ID, title: "" }).success
    ).toBe(false);
  });
});

describe("deleteTaskInputSchema", () => {
  it("requires a uuid id", () => {
    expect(deleteTaskInputSchema.safeParse({ id: TASK_ID }).success).toBe(true);
    expect(deleteTaskInputSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});

describe("createCheckoutSessionInputSchema", () => {
  it("requires a priceId and validates optional URLs", () => {
    expect(
      createCheckoutSessionInputSchema.safeParse({ priceId: "price_123" })
        .success
    ).toBe(true);
    expect(
      createCheckoutSessionInputSchema.safeParse({ priceId: "" }).success
    ).toBe(false);
    expect(
      createCheckoutSessionInputSchema.safeParse({
        priceId: "price_123",
        successUrl: "not a url",
      }).success
    ).toBe(false);
    expect(
      createCheckoutSessionInputSchema.safeParse({
        priceId: "price_123",
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      }).success
    ).toBe(true);
  });
});

describe("stripeWebhookInputSchema", () => {
  it("requires a non-empty payload and signature", () => {
    expect(
      stripeWebhookInputSchema.safeParse({ payload: "{}", signature: "t=1" })
        .success
    ).toBe(true);
    expect(
      stripeWebhookInputSchema.safeParse({ payload: "{}", signature: null })
        .success
    ).toBe(false);
    expect(
      stripeWebhookInputSchema.safeParse({ payload: "", signature: "t=1" })
        .success
    ).toBe(false);
  });
});

describe("updateProfileInputSchema", () => {
  it("requires a non-empty name", () => {
    expect(updateProfileInputSchema.safeParse({ name: "Ada" }).success).toBe(
      true
    );
    expect(updateProfileInputSchema.safeParse({ name: "" }).success).toBe(
      false
    );
  });
});
