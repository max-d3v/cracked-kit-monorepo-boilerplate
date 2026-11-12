import type { WebhookDatabaseAdapter } from "@workspace/payment/webhooks";
import {
  handleWebhookEvent,
  verifyWebhookSignature,
} from "@workspace/payment/webhooks";
import {
  create,
  get,
  updateOne,
} from "@workspace/repository/entities/subscription";
import { HttpError } from "@workspace/types/errors/http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleStripeWebhook } from "../src/use-cases/payments";
import { makeSubscription, USER_ID } from "./fixtures";

const keys = vi.hoisted(() => ({
  env: { STRIPE_WEBHOOK_SECRET: "whsec_test" as string | undefined },
}));

vi.mock("@workspace/payment/keys", () => keys);
vi.mock("@workspace/payment/webhooks", () => ({
  handleWebhookEvent: vi.fn(),
  verifyWebhookSignature: vi.fn(),
}));
vi.mock("@workspace/repository/entities/subscription", () => ({
  create: vi.fn(),
  get: vi.fn(),
  updateOne: vi.fn(),
}));

const event = {
  id: "evt_123",
  type: "customer.created",
} as ReturnType<typeof verifyWebhookSignature>;
const input = { payload: '{"id":"evt_123"}', signature: "t=1,v1=abc" };

const subscriptionData = {
  userId: USER_ID,
  plan: "pro",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  stripeSubscriptionStatus: "active",
  stripePriceId: "price_test_pro",
  stripeCurrentPeriodEnd: new Date("2026-02-01T00:00:00.000Z"),
};

/** Run a webhook and return the database adapter the use-case handed over. */
const captureDbAdapter = async (): Promise<WebhookDatabaseAdapter> => {
  await handleStripeWebhook(input);
  const adapter = vi.mocked(handleWebhookEvent).mock.calls[0]?.[1];
  if (!adapter) {
    throw new Error("handleWebhookEvent was not called with an adapter");
  }
  return adapter;
};

beforeEach(() => {
  keys.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  vi.mocked(verifyWebhookSignature).mockReturnValue(event);
});

describe("handleStripeWebhook", () => {
  it("verifies the signature and hands the event to the webhook handler", async () => {
    await expect(handleStripeWebhook(input)).resolves.toEqual({
      received: true,
    });

    expect(verifyWebhookSignature).toHaveBeenCalledWith(
      input.payload,
      input.signature,
      "whsec_test"
    );
    expect(handleWebhookEvent).toHaveBeenCalledWith(event, expect.any(Object));
  });

  it("refuses to process webhooks when no secret is configured", async () => {
    keys.env.STRIPE_WEBHOOK_SECRET = undefined;

    await expect(handleStripeWebhook(input)).rejects.toThrow(
      "STRIPE_WEBHOOK_SECRET is not set"
    );
    expect(verifyWebhookSignature).not.toHaveBeenCalled();
    expect(handleWebhookEvent).not.toHaveBeenCalled();
  });

  it("does not handle events whose signature is invalid", async () => {
    vi.mocked(verifyWebhookSignature).mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    await expect(handleStripeWebhook(input)).rejects.toThrow(
      "No signatures found"
    );
    expect(handleWebhookEvent).not.toHaveBeenCalled();
  });
});

describe("webhook database adapter", () => {
  it("updates an existing subscription row", async () => {
    vi.mocked(get).mockResolvedValue(makeSubscription());
    const adapter = await captureDbAdapter();

    await adapter.updateUserSubscription(subscriptionData);

    expect(get).toHaveBeenCalledWith({ userId: USER_ID });
    expect(updateOne).toHaveBeenCalledWith(subscriptionData);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the subscription row when the user has none", async () => {
    vi.mocked(get).mockRejectedValue(
      new HttpError(404, "Subscription not found")
    );
    const adapter = await captureDbAdapter();

    await adapter.updateUserSubscription(subscriptionData);

    expect(create).toHaveBeenCalledWith(subscriptionData);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it("downgrades the user to free when their subscription is canceled", async () => {
    const adapter = await captureDbAdapter();

    await adapter.cancelUserSubscription(USER_ID);

    expect(updateOne).toHaveBeenCalledWith({
      userId: USER_ID,
      plan: "free",
      stripeSubscriptionStatus: "canceled",
    });
  });
});
