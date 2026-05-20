# Layer 5: RPC

**Package:** `@workspace/rpc`
**Purpose:** oRPC routers that expose use cases over HTTP. Handles input
validation (Zod), authentication (Clerk via middleware), and response
serialization. No business logic here — just wiring.

## Exports

```json
"."          → src/index.ts      (router aggregation object)
"./orpc/*"   → src/orpc/*.ts     (oRPC server utilities if needed)
```

## `authenticatedProcedure` (the base)

Source: `packages/rpc/src/base.ts`

```ts
import { os } from "@orpc/server";
import { authMiddleware } from "./middleware/auth";

export const publicProcedure       = os;
export const authenticatedProcedure = publicProcedure.use(authMiddleware);
```

The `authMiddleware` calls `auth()` from `@workspace/auth/server` (Clerk),
extracts `userId`, and injects `context.user.id` for handlers to use.

## Router File Pattern

Source: `packages/rpc/src/routers/tasks.ts`

```ts
// packages/rpc/src/routers/<entity>.ts
import { create<Entity>, update<Entity>, delete<Entity>, getUser<Entity>s } from "@workspace/core/use-cases/<entity>";
import {
  create<Entity>InputSchema,
  update<Entity>InputSchema,
  delete<Entity>InputSchema,
} from "@workspace/types/use-cases/<entity>";
import { authenticatedProcedure } from "../procedures";

const <entity>Router = {
  // No .input() = accepts no params
  list: authenticatedProcedure.handler(async ({ context }) => {
    return await getUser<Entity>s({ userId: context.user.id });
  }),

  // .input(schema) validates and types the request body
  create: authenticatedProcedure
    .input(create<Entity>InputSchema)
    .handler(async ({ context, input }) => {
      return await create<Entity>({ userId: context.user.id, ...input });
    }),

  update: authenticatedProcedure
    .input(update<Entity>InputSchema)
    .handler(async ({ context, input }) => {
      const { id: entityId, ...data } = input;
      return await update<Entity>({ userId: context.user.id, entityId, data });
    }),

  delete: authenticatedProcedure
    .input(delete<Entity>InputSchema)
    .handler(async ({ context, input }) => {
      return await delete<Entity>({ userId: context.user.id, entityId: input.id });
    }),
};

export default <entity>Router;   // ← MUST be default export
```

## Router Registration

Source: `packages/rpc/src/index.ts`

```ts
import accountRouter     from "./routers/account";
import billingRouter     from "./routers/billing";
import tasksRouter       from "./routers/tasks";
// Add your new router import here ↓
import <entity>Router   from "./routers/<entity>";

export const router = {
  tasks:       tasksRouter,
  account:     accountRouter,
  billing:     billingRouter,
  // Register here ↓ (key becomes the namespace in orpc.<key>.method)
  <entity>s:  <entity>Router,
};
```

## Key Conventions

- **`export default`:** every router file must use `export default`, not a named export
- **No authorization in handlers:** just call the use case — it handles auth
- **`context.user.id`:** the user ID from Clerk, injected by `authMiddleware`
- **`.input(schema)` is optional:** omit it for handlers that take no user input (e.g. `list` with userId from context only)
- **Input schema source:** always import from `@workspace/types/use-cases/<entity>`, not from `@workspace/types/repository/<entity>` — the use-case schemas are stricter
- **Destructure in handler:** `const { id: entityId, ...data } = input` — destructure at the handler level, don't pass `input` directly to use cases
- **Router key naming:** use the plural entity name for the router key (`tasks`, `notes`, `entities`) so `orpc.tasks.create` reads naturally
