import { handleStripeWebhook } from "@workspace/core/use-cases/payments";
import { stripeWebhookInputSchema } from "@workspace/types/use-cases/payments";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { withRouteErrorHandling } from "@/lib/route-error-handler";

function isExpectedStripeWebhookError(error: unknown): boolean {
  return (
    error instanceof ZodError ||
    (error instanceof Error &&
      error.name === "StripeSignatureVerificationError")
  );
}

function getStripeWebhookErrorResponse(error: unknown) {
  const status = isExpectedStripeWebhookError(error) ? 400 : 500;
  const message =
    error instanceof Error ? error.message : "Unknown webhook error";

  return {
    body: { error: message },
    status,
  };
}

export const POST = withRouteErrorHandling(
  async (request: Request): Promise<NextResponse> => {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    const input = stripeWebhookInputSchema.parse({ payload, signature });
    const result = await handleStripeWebhook(input);

    return NextResponse.json(result, { status: 200 });
  },
  {
    getErrorResponse: getStripeWebhookErrorResponse,
    isExpectedError: isExpectedStripeWebhookError,
    route: "/api/webhooks/stripe",
    tags: {
      route_kind: "webhook",
      webhook_provider: "stripe",
    },
  }
);
