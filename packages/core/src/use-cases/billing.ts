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
import type {
  CancelUserSubscription,
  CreateUserBillingPortalSession,
  CreateUserCheckoutSession,
  GetSubscriptionStatus,
} from "@workspace/types/use-cases/billing";
import {
  assertHasStripeCustomer,
  assertHasSubscription,
} from "../authorization/billing";

export const getSubscriptionStatus = async (params: GetSubscriptionStatus) => {
  const { userId } = params;

  const userSubscription = await getOrCreate({ userId });

  if (!userSubscription.stripeSubscriptionId) {
    return { subscription: null, plan: "free" };
  }

  const subscription = await getSubscription(
    userSubscription.stripeSubscriptionId
  );

  if (!subscription) {
    return { subscription: null, plan: userSubscription.plan ?? "free" };
  }

  return { subscription, plan: subscription.plan };
};

export const cancelUserSubscription = async (
  params: CancelUserSubscription
) => {
  const { userId } = params;

  const userSubscription = await getOrCreate({ userId });
  assertHasSubscription(userSubscription);

  await cancelSubscription(userSubscription.stripeSubscriptionId as string);

  await updateOne({
    userId,
    stripeSubscriptionStatus: "canceled",
  });

  return { deleted: true };
};

export const createUserCheckoutSession = async (
  params: CreateUserCheckoutSession
) => {
  const { userId, email, priceId, successUrl, cancelUrl } = params;

  const session = await createCheckoutSession(userId, email, priceId, {
    successUrl,
    cancelUrl,
  });

  return { url: session.url ?? "", sessionId: session.id };
};

export const createUserBillingPortalSession = async (
  params: CreateUserBillingPortalSession
) => {
  const { userId } = params;

  const userSubscription = await getOrCreate({ userId });
  assertHasStripeCustomer(userSubscription);

  const session = await createBillingPortalSession(
    userSubscription.stripeCustomerId as string
  );

  return { url: session.url };
};
