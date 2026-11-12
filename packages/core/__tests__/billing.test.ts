import {
  cancelSubscription,
  createBillingPortalSession,
  createCheckoutSession,
  getSubscription,
} from "@workspace/payment/server";
import {
  getOrCreate,
  updateOne,
} from "@workspace/repository/entities/subscription";
import { HttpError } from "@workspace/types/errors/http";
import type { StripeSubscription } from "@workspace/types/payments/billing";
import { describe, expect, it, vi } from "vitest";
import {
  assertHasStripeCustomer,
  assertHasSubscription,
} from "../src/authorization/billing";
import {
  cancelUserSubscription,
  createUserBillingPortalSession,
  createUserCheckoutSession,
  getSubscriptionStatus,
} from "../src/use-cases/billing";
import { makeSubscription, USER_ID } from "./fixtures";

vi.mock("@workspace/payment/server", () => ({
  cancelSubscription: vi.fn(),
  createBillingPortalSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  getSubscription: vi.fn(),
}));
vi.mock("@workspace/repository/entities/subscription", () => ({
  getOrCreate: vi.fn(),
  updateOne: vi.fn(),
}));

const stripeSubscription: StripeSubscription = {
  id: "sub_123",
  customerId: "cus_123",
  status: "active",
  priceId: "price_test_pro",
  currentPeriodEnd: new Date("2026-02-01T00:00:00.000Z"),
  cancelAtPeriodEnd: false,
  plan: "pro",
};

type CheckoutSession = Awaited<ReturnType<typeof createCheckoutSession>>;
type PortalSession = Awaited<ReturnType<typeof createBillingPortalSession>>;

const subscribed = makeSubscription({
  plan: "pro",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  stripeSubscriptionStatus: "active",
});

describe("billing authorization", () => {
  it("requires a Stripe customer", () => {
    expect(() => assertHasStripeCustomer(makeSubscription())).toThrow(
      HttpError
    );
    expect(() => assertHasStripeCustomer(subscribed)).not.toThrow();
  });

  it("requires a Stripe subscription", () => {
    expect(() => assertHasSubscription(makeSubscription())).toThrow(
      "No active subscription"
    );
    expect(() => assertHasSubscription(subscribed)).not.toThrow();
  });
});

describe("getSubscriptionStatus", () => {
  it("reports the free plan when the user never subscribed", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(makeSubscription());

    await expect(getSubscriptionStatus({ userId: USER_ID })).resolves.toEqual({
      subscription: null,
      plan: "free",
    });
    expect(getOrCreate).toHaveBeenCalledWith({ userId: USER_ID });
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it("returns the live Stripe subscription and its plan", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(subscribed);
    vi.mocked(getSubscription).mockResolvedValue(stripeSubscription);

    await expect(getSubscriptionStatus({ userId: USER_ID })).resolves.toEqual({
      subscription: stripeSubscription,
      plan: "pro",
    });
    expect(getSubscription).toHaveBeenCalledWith("sub_123");
  });

  it("falls back to the stored plan when Stripe has no subscription", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(subscribed);
    vi.mocked(getSubscription).mockResolvedValue(null);

    await expect(getSubscriptionStatus({ userId: USER_ID })).resolves.toEqual({
      subscription: null,
      plan: "pro",
    });
  });

  it("falls back to free when nothing is stored either", async () => {
    vi.mocked(getOrCreate).mockResolvedValue({ ...subscribed, plan: null });
    vi.mocked(getSubscription).mockResolvedValue(null);

    const result = await getSubscriptionStatus({ userId: USER_ID });

    expect(result.plan).toBe("free");
  });
});

describe("cancelUserSubscription", () => {
  it("cancels in Stripe and marks the local subscription as canceled", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(subscribed);

    await expect(cancelUserSubscription({ userId: USER_ID })).resolves.toEqual({
      deleted: true,
    });
    expect(cancelSubscription).toHaveBeenCalledWith("sub_123");
    expect(updateOne).toHaveBeenCalledWith({
      userId: USER_ID,
      stripeSubscriptionStatus: "canceled",
    });
  });

  it("refuses to cancel when there is no subscription", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(makeSubscription());

    await expect(
      cancelUserSubscription({ userId: USER_ID })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(cancelSubscription).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });
});

describe("createUserCheckoutSession", () => {
  it("creates a checkout session and returns its url and id", async () => {
    vi.mocked(createCheckoutSession).mockResolvedValue({
      id: "cs_123",
      url: "https://checkout.stripe.com/cs_123",
    } as CheckoutSession);

    const result = await createUserCheckoutSession({
      userId: USER_ID,
      email: "ada@example.com",
      priceId: "price_test_pro",
      successUrl: "https://app.example.com/ok",
    });

    expect(result).toEqual({
      url: "https://checkout.stripe.com/cs_123",
      sessionId: "cs_123",
    });
    expect(createCheckoutSession).toHaveBeenCalledWith(
      USER_ID,
      "ada@example.com",
      "price_test_pro",
      { successUrl: "https://app.example.com/ok", cancelUrl: undefined }
    );
  });

  it("returns an empty url when Stripe does not provide one", async () => {
    vi.mocked(createCheckoutSession).mockResolvedValue({
      id: "cs_123",
      url: null,
    } as CheckoutSession);

    const result = await createUserCheckoutSession({
      userId: USER_ID,
      email: "ada@example.com",
      priceId: "price_test_pro",
    });

    expect(result.url).toBe("");
  });
});

describe("createUserBillingPortalSession", () => {
  it("opens the portal for the user's Stripe customer", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(subscribed);
    vi.mocked(createBillingPortalSession).mockResolvedValue({
      url: "https://billing.stripe.com/session",
    } as PortalSession);

    await expect(
      createUserBillingPortalSession({ userId: USER_ID })
    ).resolves.toEqual({ url: "https://billing.stripe.com/session" });
    expect(createBillingPortalSession).toHaveBeenCalledWith("cus_123");
  });

  it("refuses when the user has no Stripe customer yet", async () => {
    vi.mocked(getOrCreate).mockResolvedValue(makeSubscription());

    await expect(
      createUserBillingPortalSession({ userId: USER_ID })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(createBillingPortalSession).not.toHaveBeenCalled();
  });
});
