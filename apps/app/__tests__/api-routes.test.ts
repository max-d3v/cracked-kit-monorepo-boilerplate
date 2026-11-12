import { handleStripeWebhook } from "@workspace/core/use-cases/payments";
import { captureException } from "@workspace/observability/server";
import { describe, expect, it, vi } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { POST as postStripeWebhook } from "@/app/api/webhooks/stripe/route";

vi.mock("@workspace/core/use-cases/payments", () => ({
  handleStripeWebhook: vi.fn(),
}));
vi.mock("@workspace/observability/server", () => ({
  captureException: vi.fn(),
}));

const OK = 200;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

const PAYLOAD = '{"id":"evt_123","type":"checkout.session.completed"}';

const webhookRequest = (signature?: string) =>
  new Request("https://app.example.com/api/webhooks/stripe", {
    method: "POST",
    body: PAYLOAD,
    headers: signature ? { "stripe-signature": signature } : {},
  });

class StripeSignatureVerificationError extends Error {
  override name = "StripeSignatureVerificationError";
}

describe("GET /api/health", () => {
  it("reports the API as healthy", async () => {
    const response = getHealth();

    expect(response.status).toBe(OK);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { status: "OK" },
      message: "API is healthy",
    });
  });
});

describe("POST /api/webhooks/stripe", () => {
  it("passes the raw payload and signature to the use-case", async () => {
    vi.mocked(handleStripeWebhook).mockResolvedValue({ received: true });

    const response = await postStripeWebhook(webhookRequest("t=1,v1=abc"), {});

    expect(response.status).toBe(OK);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(handleStripeWebhook).toHaveBeenCalledWith({
      payload: PAYLOAD,
      signature: "t=1,v1=abc",
    });
  });

  it("returns 400 without calling the use-case when the signature header is missing", async () => {
    const response = await postStripeWebhook(webhookRequest(), {});

    expect(response.status).toBe(BAD_REQUEST);
    expect(handleStripeWebhook).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid signatures without reporting them", async () => {
    vi.mocked(handleStripeWebhook).mockRejectedValue(
      new StripeSignatureVerificationError("No signatures found")
    );

    const response = await postStripeWebhook(webhookRequest("t=1,v1=bad"), {});

    expect(response.status).toBe(BAD_REQUEST);
    await expect(response.json()).resolves.toEqual({
      error: "No signatures found",
    });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("returns 500 and reports unexpected failures so Stripe retries", async () => {
    const failure = new Error("db down");
    vi.mocked(handleStripeWebhook).mockRejectedValue(failure);

    const response = await postStripeWebhook(webhookRequest("t=1,v1=abc"), {});

    expect(response.status).toBe(INTERNAL_SERVER_ERROR);
    expect(captureException).toHaveBeenCalledWith(
      failure,
      expect.objectContaining({
        tags: expect.objectContaining({
          route: "/api/webhooks/stripe",
          webhook_provider: "stripe",
        }),
      })
    );
  });
});
