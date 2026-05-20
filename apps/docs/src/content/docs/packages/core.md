---
title: Core (Use Cases)
description: Business logic layer with use cases and authorization rules
---

The Core package (`@workspace/core`) contains the application's business logic. It orchestrates repository calls, enforces authorization rules, and composes data from multiple sources. No HTTP, no UI, no database queries -- just pure business logic.

**Layer:** Business Logic
**Depends on:** `@workspace/repository`, `@workspace/payment`, `@workspace/types`
**Consumed by:** `@workspace/rpc`

## Package Exports

```json
{
  "exports": {
    "./use-cases/*": "./src/use-cases/*.ts"
  }
}
```

Import example: `import { createTask } from "@workspace/core/use-cases/tasks"`

## Structure

```
packages/core/src/
├── use-cases/
│   ├── tasks.ts          # Task CRUD with authorization
│   ├── account.ts        # Profile management
│   ├── users.ts          # User queries
│   ├── billing.ts        # Subscription management
│   └── preferences.ts    # User preferences
└── authorization/
    ├── tasks.ts          # Task ownership checks
    └── billing.ts        # Subscription validation
```

## Use Cases

### Tasks

```typescript
// src/use-cases/tasks.ts

// Fetches tasks and counts by status
export const getUserTasksWithCount = async ({ userId }) => {
  const tasks = await tasksRepository.list({ userId });
  const taskCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };
  return { tasks, taskCounts };
};

// Creates a task with the default status
export const createTask = async ({ userId, title, description }) => {
  return tasksRepository.create({ userId, title, description, status: "todo" });
};

// Updates a task after verifying ownership
export const updateTask = async ({ userId, taskId, data }) => {
  const task = await tasksRepository.get(taskId);
  assertTaskOwnership(task, userId);
  return tasksRepository.updateOne(taskId, data);
};

// Deletes a task after verifying ownership
export const deleteTask = async ({ userId, taskId }) => {
  const task = await tasksRepository.get(taskId);
  assertTaskOwnership(task, userId);
  return tasksRepository.deleteOne(taskId);
};
```

### Billing

```typescript
// src/use-cases/billing.ts

export const getSubscriptionStatus = async ({ userId }) => {
  const subscription = await subscriptionRepository.get({ userId });
  assertHasStripeCustomer(subscription);
  assertHasSubscription(subscription);
  return getSubscription(subscription.stripeSubscriptionId);
};

export const cancelUserSubscription = async ({ userId }) => {
  const subscription = await subscriptionRepository.get({ userId });
  assertHasSubscription(subscription);
  return cancelSubscription(subscription.stripeSubscriptionId);
};

export const createUserCheckoutSession = async ({ userId, email, priceId }) => {
  const subscription = await subscriptionRepository.getOrCreate({ userId });
  return createCheckoutSession({ userId, email, priceId, customerId: subscription.stripeCustomerId });
};
```

### Account

```typescript
// src/use-cases/account.ts

export const updateProfile = async ({ userId, name }) => {
  return usersRepository.updateOne(userId, { name });
};

export const deleteAccount = async ({ userId }) => {
  return usersRepository.deleteOne(userId);
};
```

## Authorization

Authorization rules are explicit functions in the `authorization/` directory. They throw `HttpError` when a rule is violated.

### Task Authorization

```typescript
// src/authorization/tasks.ts
import { HttpError } from "@workspace/types/errors/http";

export const assertTaskOwnership = (task, userId) => {
  if (task.userId !== userId) {
    throw new HttpError(403, "You do not own this task");
  }
};
```

### Billing Authorization

```typescript
// src/authorization/billing.ts
import { HttpError } from "@workspace/types/errors/http";

export const assertHasStripeCustomer = (preferences) => {
  if (!preferences.stripeCustomerId) {
    throw new HttpError(400, "No Stripe customer found");
  }
};

export const assertHasSubscription = (preferences) => {
  if (!preferences.stripeSubscriptionId) {
    throw new HttpError(400, "No active subscription");
  }
};
```

## Design Principles

1. **Use cases are the single entry point for business logic.** RPC procedures call use cases. Use cases call repositories. Nothing else calls repositories directly.

2. **Authorization is explicit.** Every mutation that requires ownership checks calls an `assert*` function. The check is visible in the code, not hidden in middleware.

3. **Use cases compose data from multiple sources.** `createTask` reads preferences to get the default status, then writes to the tasks repository. This orchestration belongs here, not in the repository.

4. **Use cases are pure functions (async).** They take input, call repositories, apply business rules, and return results. No HTTP concerns, no UI concerns.

## Dependencies

```json
{
  "@workspace/payment": "workspace:*",
  "@workspace/repository": "workspace:*",
  "@workspace/types": "workspace:*"
}
```

## Related

- [Clean Architecture](/architecture/clean-architecture) - Where Core sits in the layers
- [Repository Package](/packages/repository) - The data access layer Core delegates to
- [RPC Package](/packages/rpc) - The API layer that calls Core use cases
