import type { subscription } from "@workspace/database/schema";
import type { ListBaseParams } from "./base";

export type SubscriptionRawObject = typeof subscription.$inferSelect;

export type CreateSubscriptionParams = typeof subscription.$inferInsert;

export type UpdateSubscriptionParams = Partial<
  typeof subscription.$inferInsert
> & {
  userId: string;
};

export type WhereParams = {
  userId?: string;
};

export type JoinableParams = {
  user: boolean;
};

export type GetSubscriptionParams = {
  userId: string;
};

export type DeleteSubscriptionParams = {
  userId: string;
};

export type WhereClauseParams = WhereParams & {
  search?: string;
};

export type ListSubscriptionsParams = ListBaseParams &
  WhereParams & {
    include?: JoinableParams;
  };
