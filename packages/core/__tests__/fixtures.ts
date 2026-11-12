import type { SubscriptionRawObject } from "@workspace/types/repository/subscription";
import type { TaskRawObject } from "@workspace/types/repository/tasks";
import type { UserRawObject } from "@workspace/types/repository/users";

export const USER_ID = "user_1";
export const TASK_ID = "6f1c2a4e-8b3d-4c7a-9e2f-1a2b3c4d5e6f";

const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");

export const makeTask = (
  overrides: Partial<TaskRawObject> = {}
): TaskRawObject => ({
  id: TASK_ID,
  userId: USER_ID,
  title: "Write tests",
  description: null,
  status: "todo",
  priority: 0,
  dueDate: null,
  completedAt: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

export const makeSubscription = (
  overrides: Partial<SubscriptionRawObject> = {}
): SubscriptionRawObject => ({
  id: "0d9b0a8e-1c2d-4e3f-8a9b-0c1d2e3f4a5b",
  userId: USER_ID,
  plan: "free",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeSubscriptionStatus: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

export const makeUser = (
  overrides: Partial<UserRawObject> = {}
): UserRawObject => ({
  id: USER_ID,
  name: "Ada Lovelace",
  email: "ada@example.com",
  emailVerified: true,
  image: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});
