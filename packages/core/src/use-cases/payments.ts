import { env } from "@workspace/payment/keys";
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
import type {
  HandleStripeWebhook,
  HandleStripeWebhookResponse,
} from "@workspace/types/use-cases/payments";

const dbAdapter: WebhookDatabaseAdapter = {
  updateUserSubscription: async (data) => {
    try {
      await get({ userId: data.userId });

      await updateOne({
        userId: data.userId,
        plan: data.plan,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeSubscriptionStatus: data.stripeSubscriptionStatus,
        stripePriceId: data.stripePriceId,
        stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
      });
    } catch {
      await create({
        userId: data.userId,
        plan: data.plan,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeSubscriptionStatus: data.stripeSubscriptionStatus,
        stripePriceId: data.stripePriceId,
        stripeCurrentPeriodEnd: data.stripeCurrentPeriodEnd,
      });
    }
  },

  cancelUserSubscription: async (userId) => {
    await updateOne({
      userId,
      plan: "free",
      stripeSubscriptionStatus: "canceled",
    });
  },
};

export const handleStripeWebhook = async (
  params: HandleStripeWebhook
): Promise<HandleStripeWebhookResponse> => {
  const { payload, signature } = params;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set — cannot verify Stripe webhooks."
    );
  }

  const event = verifyWebhookSignature(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  await handleWebhookEvent(event, dbAdapter);

  return { received: true };
};
