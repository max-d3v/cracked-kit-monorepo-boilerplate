import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStripe } from "../src/server";
import {
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  handleWebhookEvent,
  type WebhookDatabaseAdapter,
} from "../src/webhooks";

vi.mock("../src/server", () => ({ getStripe: vi.fn() }));

// 2026-01-01T00:00:00.000Z, as Stripe sends it (seconds since epoch).
const PERIOD_END_SECONDS = 1_767_225_600;
const PERIOD_END = new Date("2026-01-01T00:00:00.000Z");

const retrieveSubscription = vi.fn();

const makeSubscription = (params: {
  priceId?: string;
  userId?: string;
}): Stripe.Subscription =>
  ({
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    current_period_end: PERIOD_END_SECONDS,
    metadata: params.userId ? { userId: params.userId } : {},
    items: {
      data: params.priceId ? [{ price: { id: params.priceId } }] : [],
    },
  }) as unknown as Stripe.Subscription;

const makeSession = (
  session: Partial<
    Pick<
      Stripe.Checkout.Session,
      "metadata" | "client_reference_id" | "subscription"
    >
  >
): Stripe.Checkout.Session =>
  ({
    metadata: {},
    client_reference_id: null,
    subscription: null,
    ...session,
  }) as unknown as Stripe.Checkout.Session;

const makeEvent = (type: string, object: unknown): Stripe.Event =>
  ({ type, data: { object } }) as unknown as Stripe.Event;

let db: {
  updateUserSubscription: ReturnType<
    typeof vi.fn<WebhookDatabaseAdapter["updateUserSubscription"]>
  >;
  cancelUserSubscription: ReturnType<
    typeof vi.fn<WebhookDatabaseAdapter["cancelUserSubscription"]>
  >;
};

beforeEach(() => {
  db = {
    updateUserSubscription: vi.fn<
      WebhookDatabaseAdapter["updateUserSubscription"]
    >(async () => undefined),
    cancelUserSubscription: vi.fn<
      WebhookDatabaseAdapter["cancelUserSubscription"]
    >(async () => undefined),
  };
  vi.mocked(getStripe).mockReturnValue({
    subscriptions: { retrieve: retrieveSubscription },
  } as unknown as Stripe);
});

describe("handleCheckoutCompleted", () => {
  it("stores the Stripe subscription for the user in the session metadata", async () => {
    retrieveSubscription.mockResolvedValue(
      makeSubscription({ priceId: "price_test_pro" })
    );

    await handleCheckoutCompleted(
      makeSession({ metadata: { userId: "user_1" }, subscription: "sub_123" }),
      db
    );

    expect(retrieveSubscription).toHaveBeenCalledWith("sub_123");
    expect(db.updateUserSubscription).toHaveBeenCalledWith({
      userId: "user_1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripeSubscriptionStatus: "active",
      stripePriceId: "price_test_pro",
      stripeCurrentPeriodEnd: PERIOD_END,
      plan: "pro",
    });
  });

  it("falls back to client_reference_id and expanded subscription objects", async () => {
    retrieveSubscription.mockResolvedValue(
      makeSubscription({ priceId: "price_test_enterprise" })
    );

    await handleCheckoutCompleted(
      makeSession({
        client_reference_id: "user_2",
        subscription: { id: "sub_456" } as Stripe.Subscription,
      }),
      db
    );

    expect(retrieveSubscription).toHaveBeenCalledWith("sub_456");
    expect(db.updateUserSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_2", plan: "enterprise" })
    );
  });

  it("rejects sessions without a user", async () => {
    await expect(
      handleCheckoutCompleted(makeSession({ subscription: "sub_123" }), db)
    ).rejects.toThrow("No userId in session metadata");
    expect(db.updateUserSubscription).not.toHaveBeenCalled();
  });

  it("rejects sessions without a subscription", async () => {
    await expect(
      handleCheckoutCompleted(makeSession({ metadata: { userId: "u" } }), db)
    ).rejects.toThrow("No subscription ID in session");
    expect(db.updateUserSubscription).not.toHaveBeenCalled();
  });

  it("rejects subscriptions whose price does not map to a plan", async () => {
    retrieveSubscription.mockResolvedValue(
      makeSubscription({ priceId: "price_unknown" })
    );

    await expect(
      handleCheckoutCompleted(
        makeSession({ metadata: { userId: "u" }, subscription: "sub_123" }),
        db
      )
    ).rejects.toThrow("Invalid price ID or plan not found");
    expect(db.updateUserSubscription).not.toHaveBeenCalled();
  });
});

describe("handleSubscriptionUpdated", () => {
  it("syncs the new plan for the user", async () => {
    await handleSubscriptionUpdated(
      makeSubscription({ userId: "user_1", priceId: "price_test_enterprise" }),
      db
    );

    expect(db.updateUserSubscription).toHaveBeenCalledWith({
      userId: "user_1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripeSubscriptionStatus: "active",
      stripePriceId: "price_test_enterprise",
      stripeCurrentPeriodEnd: PERIOD_END,
      plan: "enterprise",
    });
  });

  it("ignores subscriptions that are not linked to a user", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await handleSubscriptionUpdated(
      makeSubscription({ priceId: "price_test_pro" }),
      db
    );

    expect(db.updateUserSubscription).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it("rejects unknown prices", async () => {
    await expect(
      handleSubscriptionUpdated(
        makeSubscription({ userId: "user_1", priceId: "price_unknown" }),
        db
      )
    ).rejects.toThrow("Invalid price ID or plan not found");
  });
});

describe("handleSubscriptionDeleted", () => {
  it("cancels the user's subscription", async () => {
    await handleSubscriptionDeleted(makeSubscription({ userId: "user_1" }), db);

    expect(db.cancelUserSubscription).toHaveBeenCalledWith("user_1");
  });

  it("ignores subscriptions that are not linked to a user", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await handleSubscriptionDeleted(makeSubscription({}), db);

    expect(db.cancelUserSubscription).not.toHaveBeenCalled();
  });
});

describe("handleWebhookEvent", () => {
  it("routes checkout.session.completed to the checkout handler", async () => {
    retrieveSubscription.mockResolvedValue(
      makeSubscription({ priceId: "price_test_pro" })
    );

    await handleWebhookEvent(
      makeEvent(
        "checkout.session.completed",
        makeSession({ metadata: { userId: "user_1" }, subscription: "sub_1" })
      ),
      db
    );

    expect(db.updateUserSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1", plan: "pro" })
    );
  });

  it("routes customer.subscription.updated to the update handler", async () => {
    await handleWebhookEvent(
      makeEvent(
        "customer.subscription.updated",
        makeSubscription({ userId: "user_1", priceId: "price_test_pro" })
      ),
      db
    );

    expect(db.updateUserSubscription).toHaveBeenCalledOnce();
    expect(db.cancelUserSubscription).not.toHaveBeenCalled();
  });

  it("routes customer.subscription.deleted to the cancel handler", async () => {
    await handleWebhookEvent(
      makeEvent(
        "customer.subscription.deleted",
        makeSubscription({ userId: "user_1" })
      ),
      db
    );

    expect(db.cancelUserSubscription).toHaveBeenCalledWith("user_1");
    expect(db.updateUserSubscription).not.toHaveBeenCalled();
  });

  it.each([
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.created",
  ])("does not touch the database for %s", async (type) => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    await handleWebhookEvent(makeEvent(type, { id: "evt_obj" }), db);

    expect(db.updateUserSubscription).not.toHaveBeenCalled();
    expect(db.cancelUserSubscription).not.toHaveBeenCalled();
  });
});
