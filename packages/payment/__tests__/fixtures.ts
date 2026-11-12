import type Stripe from "stripe";

// 2026-01-01T00:00:00.000Z, as Stripe sends it (seconds since epoch).
export const PERIOD_END_SECONDS = 1_767_225_600;
export const PERIOD_END = new Date("2026-01-01T00:00:00.000Z");

/** An active Stripe subscription on `priceId`, linked to `userId` if given. */
export const makeStripeSubscription = (params: {
  priceId?: string;
  userId?: string;
}): Stripe.Subscription =>
  ({
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    current_period_end: PERIOD_END_SECONDS,
    metadata: params.userId ? { userId: params.userId } : {},
    items: {
      data: params.priceId ? [{ price: { id: params.priceId } }] : [],
    },
  }) as unknown as Stripe.Subscription;
