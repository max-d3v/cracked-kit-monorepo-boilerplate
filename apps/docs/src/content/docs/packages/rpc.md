---
title: RPC
description: oRPC routers, authentication middleware, and procedure definitions
---

The RPC package (`@workspace/rpc`) defines the API surface of the application using oRPC. It creates type-safe procedures with authentication middleware and input validation, then delegates to core use cases.

**Layer:** API Surface
**Protocol:** oRPC (Object RPC)
**Auth:** Clerk session verification
**Validation:** Zod schemas from `@workspace/types`

## What oRPC Provides

oRPC gives you end-to-end type-safe RPC without code generation:
- Server defines procedures with input schemas and handlers
- Client automatically infers types from the server router
- TanStack Query integration generates `queryOptions()` and `mutationOptions()` automatically
- No manual API client code, no response type definitions, no query key management

## Package Exports

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./orpc/*": "./src/orpc/*.ts"
  }
}
```

| Export | Purpose |
| ------ | ------- |
| `.` | Root router (all procedure groups) |
| `./orpc/orpc.server` | Server-side oRPC client (direct function calls) |
| `./orpc/orpc.client` | Browser-side oRPC client (HTTP to /rpc) |
| `./orpc/tanstack` | TanStack Query utilities from server client |

## Procedure Definitions

### Base Procedures

```typescript
// src/base.ts
import { os } from "@orpc/server";
import { authMiddleware } from "./middleware/auth";

export const publicProcedure = os;
export const authenticatedProcedure = publicProcedure.use(authMiddleware);
```

`authenticatedProcedure` runs the auth middleware on every call, injecting `context.user` with `{ id, ...sessionClaims }`.

### Auth Middleware

```typescript
// src/middleware/auth.ts
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

## Routers

### Root Router

```typescript
// src/index.ts
export const router = {
  tasks: tasksRouter,
  account: accountRouter,
  billing: billingRouter,
};
```

### Tasks Router

```typescript
// src/routers/tasks.ts
export const tasksRouter = {
  getUserTasksWithCount: authenticatedProcedure.handler(async ({ context }) => {
    return getUserTasksWithCount({ userId: context.user.id });
  }),

  getUserTasks: authenticatedProcedure.handler(async ({ context }) => {
    return getUserTasks({ userId: context.user.id });
  }),

  create: authenticatedProcedure
    .input(createTaskInputSchema)
    .handler(async ({ context, input }) => {
      return createTask({ userId: context.user.id, ...input });
    }),

  update: authenticatedProcedure
    .input(updateTaskInputSchema)
    .handler(async ({ context, input }) => {
      return updateTask({ userId: context.user.id, taskId: input.id, data: input });
    }),

  delete: authenticatedProcedure
    .input(deleteTaskInputSchema)
    .handler(async ({ context, input }) => {
      return deleteTask({ userId: context.user.id, taskId: input.id });
    }),
};
```

### Billing Router

```typescript
// src/routers/billing.ts
export const billingRouter = {
  getSubscription: authenticatedProcedure.handler(async ({ context }) => {
    return getSubscriptionStatus({ userId: context.user.id });
  }),

  cancelSubscription: authenticatedProcedure.handler(async ({ context }) => {
    return cancelUserSubscription({ userId: context.user.id });
  }),

  createCheckoutSession: authenticatedProcedure
    .input(createCheckoutSessionInputSchema)
    .handler(async ({ context, input }) => {
      return createUserCheckoutSession({
        userId: context.user.id,
        email: context.user.email,
        ...input,
      });
    }),

  createBillingPortalSession: authenticatedProcedure.handler(async ({ context }) => {
    return createUserBillingPortalSession({ userId: context.user.id });
  }),
};
```

## Server and Client

### Server Client

Used for server-side data fetching (in server components). Calls procedures directly without HTTP:

```typescript
// src/orpc/orpc.server.ts
import "server-only";
import { createRouterClient } from "@orpc/server";
import { router } from "../index";

export const client = createRouterClient(router, {
  context: async () => ({
    headers: await headers(),
  }),
});
```

### Browser Client

Used for client-side mutations and refetches. Makes HTTP calls to `/rpc`:

```typescript
// src/orpc/orpc.client.ts
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

const link = new RPCLink({
  url: "/rpc",
  headers: () => ({ "Content-Type": "application/json" }),
});

export const client = createORPCClient(link);
```

### TanStack Query Utils

Generates `queryOptions()` and `mutationOptions()` from the server client:

```typescript
// src/orpc/tanstack.ts
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "./orpc.server";

export const orpc = createTanstackQueryUtils(client);
```

## Dependencies

```json
{
  "@orpc/server": "^1.13.13",
  "@clerk/nextjs": "^7.0.8",
  "@workspace/auth": "workspace:*",
  "@workspace/core": "workspace:*",
  "@workspace/types": "workspace:*",
  "next": "catalog:web",
  "zod": "catalog:schemas"
}
```

## Related

- [Clean Architecture](/architecture/clean-architecture) - Where RPC sits in the layers
- [Core Package](/packages/core) - Use cases that RPC delegates to
- [Data Layer Package](/packages/data-layer) - How apps consume oRPC
- [API Application](/apps/api) - The app that serves these procedures
