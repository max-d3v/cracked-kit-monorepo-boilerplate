# Layer 4: Core

**Package:** `@workspace/core`
**Purpose:** Business logic layer. Contains use cases (what the app does) and
authorization (who can do it). Use cases compose repository calls,
authorization checks, and cross-entity logic.

## Exports

```json
"./use-cases/*"  → src/use-cases/*.ts   (exported, callable from RPC)
```

Authorization files (`src/authorization/`) are **NOT exported** from the
package. They are internal helpers called only from within use cases.

## Authorization Pattern

Source: `packages/core/src/authorization/tasks.ts`

```ts
// packages/core/src/authorization/<entity>.ts
import { HttpError } from "@workspace/types/errors/http";
import type { EntityRawObject } from "@workspace/types/repository/<entity>";

export const assertEntityOwnership = (
  entity: EntityRawObject,
  userId: string
): void => {
  if (entity.userId !== userId) {
    throw new HttpError(403, "Forbidden");
  }
};
```

**Rules:**
- Function name: `assert<Entity>Ownership` (always this convention)
- Return type: `void` — only throws, never returns a value
- Error: `HttpError(403, "Forbidden")` — not a generic Error
- Import in use cases with a relative path: `import { assertEntityOwnership } from "../authorization/<entity>"`

## Use Cases Pattern

Source: `packages/core/src/use-cases/tasks.ts`

```ts
import * as entityRepository from "@workspace/repository/entities/<entity>";
import type { EntityRawObject } from "@workspace/types/repository/<entity>";
import type { GetUserEntityInput } from "@workspace/types/use-cases/<entity>";
import { assertEntityOwnership } from "../authorization/<entity>";

// Simple read — no authorization needed (list filtered by userId in WHERE clause)
export const getUserEntities = async (params: GetUserEntityInput) => {
  const { userId } = params;
  return await entityRepository.list({ userId });
};

// Write with ownership check — fetch first, then assert, then mutate
export const updateEntity = async (params: {
  userId: string;
  entityId: string;
  data: { title?: string; description?: string | null };
}) => {
  const { userId, entityId, data } = params;

  const entity = await entityRepository.get({ id: entityId });
  assertEntityOwnership(entity, userId);           // throws 403 if not owner

  return entityRepository.updateOne({ id: entityId, ...data });
};

export const deleteEntity = async (params: {
  userId: string;
  entityId: string;
}) => {
  const { userId, entityId } = params;

  const entity = await entityRepository.get({ id: entityId });
  assertEntityOwnership(entity, userId);

  return entityRepository.deleteOne({ id: entityId });
};

// Create with cross-entity composition (e.g. reading the user's subscription)
export const createEntity = async (params: {
  userId: string;
  title: string;
  description?: string | null;
}) => {
  const { userId, title, description } = params;

  // Example: composing another repository (gate behaviour on the plan)
  const subscription = await subscriptionRepository.getOrCreate({ userId });
  const status = subscription.plan === "pro" ? "active" : "draft";

  return entityRepository.create({ userId, title, description: description ?? null, status });
};
```

## Key Conventions

- **Import pattern:** `import * as entityRepository from "@workspace/repository/entities/<entity>"` — namespace import so intent is clear at call site (`entityRepository.get(...)`)
- **Authorize before mutating:** always `get` → `assert` → `mutate`. Never skip the get.
- **List operations don't need ownership assertion** — the `userId` WHERE clause in the repository already scopes results
- **Cross-entity composition goes here**, not in the repository. If creating an entity needs data from a preferences table, that join happens in the use case.
- **No HTTP concerns:** use cases don't know about requests/responses. They take plain params and return plain values. `HttpError` is the only exception (it's a domain error, not HTTP).

## What Goes in Core vs RPC

| Concern | Core | RPC |
|---|---|---|
| Business rules | ✅ | ❌ |
| Authorization checks | ✅ | ❌ |
| Cross-entity composition | ✅ | ❌ |
| Auth context (userId) extraction | ❌ | ✅ (from Clerk middleware) |
| Input validation (Zod) | ❌ | ✅ (`.input(schema)`) |
| HTTP method/path | ❌ | ✅ |
