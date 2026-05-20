---
title: Type System
description: How types flow from database schema through repository, use cases, and RPC to the frontend
---

:::tip[TL;DR]
Database schema is the source of truth. Drizzle ORM infers entity types. The `@workspace/types` package defines contracts for each layer (repository raw objects, use case inputs/outputs, error types). oRPC provides automatic end-to-end type inference from procedure definitions to TanStack Query hooks. No manual API client types needed.
:::

## Type Flow

```
Drizzle Schema (source of truth)
       │
       ├─> Inferred entity types (Task, User, Subscription)
       ├─> Drizzle-Zod auto-generated schemas
       │
       ▼
@workspace/types
       │
       ├─> repository/*   (raw object types for data access)
       ├─> use-cases/*     (input schemas + response types)
       ├─> errors/*        (HttpError class)
       └─> payments/*      (Stripe domain types)
       │
       ▼
@workspace/rpc (oRPC)
       │
       ├─> Input validated with Zod schemas from types
       ├─> Return types inferred from use case functions
       └─> oRPC auto-generates client types
       │
       ▼
Apps (automatic type inference via oRPC)
       │
       └─> useSuspenseQuery(orpc.tasks.getUserTasksWithCount.queryOptions())
           // TypeScript knows the exact return shape
```

## Type Ownership

| Type Category | Owner Package | Example |
| ------------- | ------------- | ------- |
| Database entities | `@workspace/database` | `tasks`, `users`, `subscription` tables |
| Raw object types | `@workspace/types/repository/*` | `TaskRawObject`, `UserRawObject` |
| Use case inputs | `@workspace/types/use-cases/*` | `createTaskInputSchema`, `UpdateTaskInput` |
| Error types | `@workspace/types/errors/*` | `HttpError` |
| Payment types | `@workspace/types/payments/*` | `CheckoutSession`, `PricingPlan` |
| Zod schemas | `@workspace/database` (via drizzle-zod) | Auto-generated insert/select schemas |

## Layer-by-Layer Type Definitions

### Database Layer

Drizzle schema is the source of truth. Types are inferred, not manually written:

```typescript
// packages/database/src/schema.ts
export const tasks = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  status: taskStatusEnum().default("todo").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Inferred types (never manually defined)
// typeof tasks.$inferSelect -> full row type
// typeof tasks.$inferInsert -> insert type (optionals for defaults)
```

### Types Package - Repository Contracts

The types package defines what the repository layer returns:

```typescript
// packages/types/src/repository/tasks.ts
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

### Types Package - Use Case Contracts

Input validation schemas and response types for the business logic layer:

```typescript
// packages/types/src/use-cases/tasks.ts
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
  dueDate: z.date().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
```

### Types Package - Error Types

```typescript
// packages/types/src/errors/http.ts
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

### RPC Layer - Automatic Type Inference

oRPC procedures are typed automatically. The return type of the handler becomes the response type. Input schemas provide input validation and typing:

```typescript
// packages/rpc/src/routers/tasks.ts
export const tasksRouter = {
  // Return type inferred from use case function
  getUserTasksWithCount: authenticatedProcedure.handler(async ({ context }) => {
    return taskUseCases.getUserTasksWithCount({ userId: context.user.id });
    // TypeScript infers: { tasks: TaskRawObject[], taskCounts: {...} }
  }),

  // Input type inferred from Zod schema
  create: authenticatedProcedure
    .input(createTaskInputSchema)
    .handler(async ({ context, input }) => {
      // input is typed as CreateTaskInput
      return taskUseCases.createTask({ userId: context.user.id, ...input });
    }),
};
```

### Frontend - Automatic Query Typing

The client gets full type inference from oRPC. No manual type definitions:

```typescript
// In a client component
const { data } = useSuspenseQuery(
  orpc.tasks.getUserTasksWithCount.queryOptions()
);
// data is typed as { tasks: TaskRawObject[], taskCounts: {...} }
// TypeScript knows the exact shape without any manual type imports

const { mutateAsync } = useMutation(
  orpc.tasks.create.mutationOptions()
);
// mutateAsync expects CreateTaskInput
// Returns the created task with full type information
```

## Export Pattern in Types Package

The types package uses wildcard path exports so each domain is importable directly:

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

Import examples:

```typescript
import type { TaskRawObject } from "@workspace/types/repository/tasks";
import { createTaskInputSchema } from "@workspace/types/use-cases/tasks";
import { HttpError } from "@workspace/types/errors/http";
import type { PricingPlan } from "@workspace/types/payments/pricing";
```

## Key Principles

1. **Schema is the source of truth.** Database schema defines entities. Types are inferred, never duplicated.

2. **Zod schemas validate at boundaries.** Input validation happens in the RPC layer via Zod schemas defined in the types package. The core and repository layers trust that input is already validated.

3. **oRPC eliminates manual API types.** No `ApiResponse<T>`, no `TasksListResponse`. The procedure return type IS the response type. The client infers it automatically.

4. **Types package defines contracts between layers.** Repository types define what the data access layer returns. Use case types define what the business logic layer accepts.

5. **Apps never import types from internal packages.** With oRPC, apps get types automatically from the procedure definitions. Explicit type imports are only needed for form schemas or shared utilities.

## Related

- [Monorepo Overview](/architecture/overview) - Export patterns and import conventions
- [Clean Architecture](/architecture/clean-architecture) - Layer responsibilities
- [Types Package](/packages/types) - Detailed package documentation
- [Database Package](/packages/database) - Schema definitions
