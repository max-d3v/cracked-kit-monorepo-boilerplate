---
title: Types
description: Shared type definitions, Zod schemas, and error classes
---

The Types package (`@workspace/types`) defines the contracts between layers. It contains repository types (what the data access layer returns), use case types (what the business logic accepts), payment domain types, and shared error classes.

**Layer:** Contracts
**Consumed by:** All core packages

## Package Exports

```json
{
  "exports": {
    "./payments/*": "./src/payments/*.ts",
    "./repository/*": "./src/repository/*.ts",
    "./errors/*": "./src/errors/*.ts",
    "./use-cases/*": "./src/use-cases/*.ts"
  }
}
```

## Structure

```
packages/types/src/
├── repository/
│   ├── base.ts               # Shared pagination types
│   ├── tasks.ts              # TaskRawObject, CreateTaskParams, etc.
│   ├── users.ts              # UserRawObject, CreateUserParams, etc.
│   └── subscription.ts       # SubscriptionRawObject, etc.
├── use-cases/
│   ├── tasks.ts              # createTaskInputSchema, UpdateTaskInput, etc.
│   ├── account.ts            # AuthUser, UpdateProfileInput, etc.
│   └── billing.ts            # CreateCheckoutSessionInput, SubscriptionResponse
├── errors/
│   └── http.ts               # HttpError class
├── payments/
│   ├── billing.ts            # CheckoutSession, PortalSession, SubscriptionStatus
│   └── pricing.ts            # PricingPlan, PricingCardProps
└── global.d.ts               # Global type declarations (Clerk custom claims)
```

## Repository Types

Types that define what the data access layer returns:

```typescript
// src/repository/tasks.ts
import type { tasks } from "@workspace/database/schema";

export type TaskRawObject = typeof tasks.$inferSelect;

export type CreateTaskParams = {
  userId: string;
  title: string;
  description?: string;
  status?: string;
};

export type UpdateTaskParams = Partial<{
  title: string;
  description: string;
  status: string;
  dueDate: Date;
  completedAt: Date;
}>;
```

```typescript
// src/repository/base.ts
import { z } from "zod";

export type ListBaseParams = {
  search?: string;
  pageNum?: number;
  pageSize?: number;
};

export const listBaseParamsSchema = z.object({
  search: z.string().optional(),
  pageNum: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
});
```

## Use Case Types

Input validation schemas and types for the business logic layer:

```typescript
// src/use-cases/tasks.ts
import { z } from "zod";

export const createTaskInputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const updateTaskInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "completed", "cancelled"]).optional(),
});

export const deleteTaskInputSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
```

## Error Types

```typescript
// src/errors/http.ts
export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
```

Used throughout the stack:
- Repository throws `HttpError(404)` for not-found
- Authorization throws `HttpError(403)` for forbidden
- Auth middleware throws `HttpError(401)` for unauthorized

## Payment Types

```typescript
// src/payments/pricing.ts
export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
};
```

```typescript
// src/payments/billing.ts
export type CheckoutSession = {
  url: string;
};

export type SubscriptionStatus = {
  id: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};
```

## Import Conventions

```typescript
// Repository types (used in repository and core)
import type { TaskRawObject, CreateTaskParams } from "@workspace/types/repository/tasks";

// Use case schemas (used in RPC for input validation)
import { createTaskInputSchema } from "@workspace/types/use-cases/tasks";

// Error types (used everywhere)
import { HttpError } from "@workspace/types/errors/http";

// Payment types (used in payment and core)
import type { PricingPlan } from "@workspace/types/payments/pricing";
```

## Dependencies

```json
{
  "@workspace/database": "workspace:*",
  "stripe": "^22.0.1",
  "zod": "catalog:schemas"
}
```

## Related

- [Type System](/architecture/type-system) - How types flow through the architecture
- [Repository Package](/packages/repository) - Implements repository types
- [Core Package](/packages/core) - Uses use case types
- [RPC Package](/packages/rpc) - Validates input with use case schemas
