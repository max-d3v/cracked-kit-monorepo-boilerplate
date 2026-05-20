---
title: Clean Architecture
description: Layered package design with RPC, Use Cases, Authorization, and Repository
---

:::tip[TL;DR]
Four core layers separate concerns: **RPC** (API surface), **Core** (business logic + authorization), **Repository** (data access), and **Database** (schema + client). Each layer depends only on the one below it. Apps never touch the database directly.
:::

## Layer Diagram

```
┌─────────────────────────────────────────────────┐
│  APPS (app, api, web)                           │
│  Consume data via oRPC client + TanStack Query  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  DATA LAYER (@workspace/data-layer)             │
│  QueryClient, hydration, oRPC TanStack utils    │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  RPC LAYER (@workspace/rpc)                     │
│  oRPC routers, auth middleware, procedures      │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  CORE LAYER (@workspace/core)                   │
│  Use cases, authorization rules                 │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  REPOSITORY LAYER (@workspace/repository)       │
│  Drizzle queries, CRUD, search, pagination      │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  DATABASE (@workspace/database)                 │
│  Schema definitions, Neon client, migrations    │
└─────────────────────────────────────────────────┘
```

## Layer 1: Database (`@workspace/database`)

The foundation. Defines the PostgreSQL schema with Drizzle ORM and provides the database client.

**Responsibility:** Schema definition, database connection, migrations.

```typescript
// packages/database/src/schema.ts
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "completed",
  "cancelled",
]);

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
```

```typescript
// packages/database/src/client.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
```

**Exports:** `./client` (db instance), `./schema` (tables + enums), `./drizzle-zod` (schema-to-zod utilities), `./keys` (env validation).

## Layer 2: Repository (`@workspace/repository`)

Pure data access. Translates business operations into Drizzle queries. No business logic, no authorization -- just CRUD with filtering and pagination.

**Responsibility:** Database queries, search, pagination, error wrapping.

```typescript
// packages/repository/src/entities/tasks.ts
import { db } from "@workspace/database/client";
import { tasks } from "@workspace/database/schema";

export const list = async ({ userId, search, pageNum, pageSize }) => {
  const query = db.query.tasks.findMany({
    where: (fields, { eq, and, or, ilike }) => {
      const conditions = [eq(fields.userId, userId)];
      if (search) {
        conditions.push(
          or(
            ilike(fields.title, `%${search}%`),
            ilike(fields.description, `%${search}%`)
          )
        );
      }
      return and(...conditions);
    },
    limit: pageSize,
    offset: (pageNum - 1) * pageSize,
    orderBy: (fields, { desc }) => desc(fields.createdAt),
  });
  return query;
};

export const create = async (params) => {
  const [task] = await db.insert(tasks).values(params).returning();
  return task;
};

export const updateOne = async (id, data) => {
  const [task] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new HttpError(404, "Task not found");
  return task;
};
```

Each entity file (users, tasks, subscription) exports standalone functions. The repository never checks ownership or authorization -- it just executes queries.

**Exports:** `./entities/*` (per-entity data access functions).

## Layer 3: Core (`@workspace/core`)

Business logic and authorization. Orchestrates repository calls, enforces ownership, validates business rules, and composes data from multiple sources.

**Responsibility:** Use cases (application logic) and authorization rules.

### Use Cases

```typescript
// packages/core/src/use-cases/tasks.ts
import * as tasksRepository from "@workspace/repository/entities/tasks";
import { assertTaskOwnership } from "../authorization/tasks";

export const createTask = async ({ userId, title, description }) => {
  return tasksRepository.create({ userId, title, description, status: "todo" });
};

export const updateTask = async ({ userId, taskId, data }) => {
  const task = await tasksRepository.get(taskId);
  // Authorization: only the owner can update
  assertTaskOwnership(task, userId);
  return tasksRepository.updateOne(taskId, data);
};

export const deleteTask = async ({ userId, taskId }) => {
  const task = await tasksRepository.get(taskId);
  assertTaskOwnership(task, userId);
  return tasksRepository.deleteOne(taskId);
};

export const getUserTasksWithCount = async ({ userId }) => {
  const tasks = await tasksRepository.list({ userId });
  const taskCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };
  return { tasks, taskCounts };
};
```

### Authorization

Authorization is a separate concern within the core layer, split into domain-specific files:

```typescript
// packages/core/src/authorization/tasks.ts
import { HttpError } from "@workspace/types/errors/http";

export const assertTaskOwnership = (task, userId) => {
  if (task.userId !== userId) {
    throw new HttpError(403, "You do not own this task");
  }
};
```

```typescript
// packages/core/src/authorization/billing.ts
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

**Exports:** `./use-cases/*` (per-domain use case functions).

## Layer 4: RPC (`@workspace/rpc`)

The API surface. Exposes use cases as type-safe oRPC procedures with authentication middleware and input validation.

**Responsibility:** Routing, authentication, input validation, delegating to use cases.

### Procedure Definitions

```typescript
// packages/rpc/src/base.ts
import { os } from "@orpc/server";
import { authMiddleware } from "./middleware/auth";

export const publicProcedure = os;
export const authenticatedProcedure = publicProcedure.use(authMiddleware);
```

### Auth Middleware

```typescript
// packages/rpc/src/middleware/auth.ts
import { auth } from "@workspace/auth/server";
import { HttpError } from "@workspace/types/errors/http";

export const authMiddleware = async ({ context, next }) => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  return next({
    context: {
      ...context,
      user: { id: userId, ...sessionClaims },
    },
  });
};
```

### Router Definition

```typescript
// packages/rpc/src/routers/tasks.ts
import { authenticatedProcedure } from "../procedures";
import * as taskUseCases from "@workspace/core/use-cases/tasks";
import { createTaskInputSchema } from "@workspace/types/use-cases/tasks";

export const tasksRouter = {
  getUserTasksWithCount: authenticatedProcedure.handler(async ({ context }) => {
    return taskUseCases.getUserTasksWithCount({
      userId: context.user.id,
    });
  }),

  create: authenticatedProcedure
    .input(createTaskInputSchema)
    .handler(async ({ context, input }) => {
      return taskUseCases.createTask({
        userId: context.user.id,
        ...input,
      });
    }),

  update: authenticatedProcedure
    .input(updateTaskInputSchema)
    .handler(async ({ context, input }) => {
      return taskUseCases.updateTask({
        userId: context.user.id,
        taskId: input.id,
        data: input,
      });
    }),
};
```

```typescript
// packages/rpc/src/index.ts
export const router = {
  tasks: tasksRouter,
  account: accountRouter,
  billing: billingRouter,
};
```

**Exports:** `.` (root router), `./orpc/*` (server client, browser client, TanStack utils).

## Request Flow Example

Creating a task from the browser:

```
1. Browser
   └─> useMutation(orpc.tasks.create.mutationOptions())
       └─> HTTP POST /rpc (oRPC protocol)

2. API App (apps/api)
   └─> RPCHandler receives request at /rpc/[[...rest]]/route.ts
       └─> Routes to tasks.create procedure

3. RPC Layer
   └─> authenticatedProcedure runs authMiddleware
       ├─> Clerk validates session, extracts userId
       ├─> Input validated against createTaskInputSchema (Zod)
       └─> Calls core use case

4. Core Layer
   └─> createTask use case
       ├─> Fetches user preferences (for default status)
       └─> Calls repository.create

5. Repository Layer
   └─> db.insert(tasks).values({...}).returning()
       └─> Drizzle executes SQL against Neon

6. Response bubbles back
   └─> TanStack Query invalidates cache
       └─> UI re-renders with new task
```

## Dependency Graph

```
@workspace/data-layer
├── @workspace/rpc
│   ├── @workspace/core
│   │   ├── @workspace/repository
│   │   │   ├── @workspace/database
│   │   │   └── @workspace/types
│   │   ├── @workspace/payment
│   │   └── @workspace/types
│   ├── @workspace/auth
│   └── @workspace/types
├── @orpc/tanstack-query
└── @tanstack/react-query
```

Each package declares its dependencies explicitly in `package.json`. Workspace packages use `"workspace:*"` for internal references.

## Why This Architecture

1. **Testable** - Each layer can be tested in isolation. Mock the repository to test use cases. Mock the core to test RPC procedures.
2. **Swappable** - Replace Clerk with another auth provider by changing only `@workspace/auth`. Replace Neon with Supabase by changing only `@workspace/database`.
3. **Readable** - Authorization rules are explicit functions, not buried in route handlers. Business logic is in one place, not scattered across API routes.
4. **Type-safe** - oRPC automatically infers types from procedure definitions. No manual API client code or response type definitions needed.

## Related

- [Monorepo Overview](/architecture/overview) - Turborepo, linting, env validation
- [Type System](/architecture/type-system) - How types flow through the layers
- [RPC Package](/packages/rpc) - Detailed oRPC documentation
- [Core Package](/packages/core) - Use cases and authorization
- [Repository Package](/packages/repository) - Data access patterns
