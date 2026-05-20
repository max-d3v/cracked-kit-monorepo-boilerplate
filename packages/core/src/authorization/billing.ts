import { HttpError } from "@workspace/types/errors/http";
import type { SubscriptionRawObject } from "@workspace/types/repository/subscription";

export const assertHasStripeCustomer = (
  subscription: SubscriptionRawObject
): void => {
  if (!subscription.stripeCustomerId) {
    throw new HttpError(
      400,
      "No active subscription found. Please subscribe to a plan first."
    );
  }
};

export const assertHasSubscription = (
  subscription: SubscriptionRawObject
): void => {
  if (!subscription.stripeSubscriptionId) {
    throw new HttpError(400, "No active subscription");
  }
};
