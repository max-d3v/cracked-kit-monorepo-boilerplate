import { describe, expect, it, vi } from "vitest";

const stripe = vi.hoisted(() => ({
  constructed: vi.fn(),
  createCheckoutSession: vi.fn(),
  createPortalSession: vi.fn(),
  retrieveSubscription: vi.fn(),
  updateSubscription: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class {
    checkout = { sessions: { create: stripe.createCheckoutSession } };
    billingPortal = { sessions: { create: stripe.createPortalSession } };
    subscriptions = {
      retrieve: stripe.retrieveSubscription,
      update: stripe.updateSubscription,
    };

    constructor(...args: unknown[]) {
      stripe.constructed(...args);
    }
  },
}));

// 2026-01-01T00:00:00.000Z, as Stripe sends it (seconds since epoch).
const PERIOD_END_SECONDS = 1_767_225_600;

/**
 * Env is read when the module is first evaluated, so each test re-imports the
 * module after stubbing the env it needs.
 */
const loadServer = async (env: Record<string, string> = {}) => {
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  vi.resetModules();
  return await import("../src/server");
};

const withStripeKey = { STRIPE_SECRET_KEY: "sk_test_123" };

describe("getStripe", () => {
  it("throws a clear error when STRIPE_SECRET_KEY is missing", async () => {
    const { getStripe } = await loadServer();

    expect(() => getStripe()).toThrow("Stripe is not configured");
    expect(stripe.constructed).not.toHaveBeenCalled();
  });

  it("creates the client once and reuses it", async () => {
    const { getStripe } = await loadServer(withStripeKey);

    const first = getStripe();
    const second = getStripe();

    expect(first).toBe(second);
    expect(stripe.constructed).toHaveBeenCalledOnce();
    expect(stripe.constructed).toHaveBeenCalledWith(
      "sk_test_123",
      expect.objectContaining({ typescript: true })
    );
  });
});

describe("createCheckoutSession", () => {
  it("creates a subscription checkout tagged with the user id", async () => {
    const { createCheckoutSession } = await loadServer(withStripeKey);
    stripe.createCheckoutSession.mockResolvedValue({ id: "cs_1" });

    const session = await createCheckoutSession(
      "user_1",
      "ada@example.com",
      "price_test_pro"
    );

    expect(session).toEqual({ id: "cs_1" });
    expect(stripe.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer_email: "ada@example.com",
        client_reference_id: "user_1",
        line_items: [{ price: "price_test_pro", quantity: 1 }],
        metadata: { userId: "user_1" },
        subscription_data: { metadata: { userId: "user_1" } },
        success_url: "http://localhost:3001/dashboard/billing?success=true",
        cancel_url: "http://localhost:3001/dashboard/billing?canceled=true",
      })
    );
  });

  it("uses NEXT_PUBLIC_APP_URL and explicit redirect URLs", async () => {
    const { createCheckoutSession } = await loadServer({
      ...withStripeKey,
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
    });
    stripe.createCheckoutSession.mockResolvedValue({ id: "cs_1" });

    await createCheckoutSession("user_1", "ada@example.com", "price_1", {
      successUrl: "https://example.com/thanks",
    });

    expect(stripe.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://example.com/thanks",
        cancel_url: "https://app.example.com/dashboard/billing?canceled=true",
      })
    );
  });
});

describe("createBillingPortalSession", () => {
  it("opens the portal for the customer and returns to billing", async () => {
    const { createBillingPortalSession } = await loadServer(withStripeKey);
    stripe.createPortalSession.mockResolvedValue({ url: "https://portal" });

    const session = await createBillingPortalSession("cus_123");

    expect(session).toEqual({ url: "https://portal" });
    expect(stripe.createPortalSession).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "http://localhost:3001/dashboard/billing",
    });
  });
});

describe("getSubscription", () => {
  const stripeSubscription = (priceId: string) => ({
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    current_period_end: PERIOD_END_SECONDS,
    items: { data: [{ price: { id: priceId } }] },
  });

  it("maps the Stripe subscription to the app's shape", async () => {
    const { getSubscription } = await loadServer(withStripeKey);
    stripe.retrieveSubscription.mockResolvedValue(
      stripeSubscription("price_test_pro")
    );

    await expect(getSubscription("sub_123")).resolves.toEqual({
      id: "sub_123",
      customerId: "cus_123",
      status: "active",
      priceId: "price_test_pro",
      currentPeriodEnd: new Date("2026-01-01T00:00:00.000Z"),
      cancelAtPeriodEnd: false,
      plan: "pro",
    });
  });

  it("falls back to the free plan for unknown prices", async () => {
    const { getSubscription } = await loadServer(withStripeKey);
    stripe.retrieveSubscription.mockResolvedValue(
      stripeSubscription("price_unknown")
    );

    const result = await getSubscription("sub_123");

    expect(result?.plan).toBe("free");
  });

  it("returns null instead of throwing when Stripe fails", async () => {
    const { getSubscription } = await loadServer(withStripeKey);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    stripe.retrieveSubscription.mockRejectedValue(new Error("No such sub"));

    await expect(getSubscription("sub_missing")).resolves.toBeNull();
  });
});

describe("cancelSubscription", () => {
  it("cancels at the end of the billing period, not immediately", async () => {
    const { cancelSubscription } = await loadServer(withStripeKey);
    stripe.updateSubscription.mockResolvedValue({ id: "sub_123" });

    await cancelSubscription("sub_123");

    expect(stripe.updateSubscription).toHaveBeenCalledWith("sub_123", {
      cancel_at_period_end: true,
    });
  });
});
