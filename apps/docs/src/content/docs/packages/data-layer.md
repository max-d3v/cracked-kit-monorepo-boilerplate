---
title: Data Layer
description: TanStack Query client, server-side hydration, and oRPC utilities
---

The Data Layer package (`@workspace/data-layer`) bridges the server and client. It creates the TanStack Query client with oRPC-compatible serialization, provides server-side hydration utilities, and exports the oRPC TanStack Query utils that apps use to fetch data.

**Layer:** Client Sync
**Depends on:** `@workspace/rpc`, `@tanstack/react-query`, `@orpc/tanstack-query`
**Consumed by:** Apps (app)

## Package Exports

```json
{
  "exports": {
    "./client": "./src/query-client.ts",
    "./hydration": "./src/hydration.tsx",
    "./orpc-tanstack-util": "./src/orpc-tanstack-util.ts"
  }
}
```

| Export | Purpose |
| ------ | ------- |
| `./client` | `createQueryClient()` factory with oRPC serialization |
| `./hydration` | `getQueryClient()` (per-request) + `HydrateClient` component |
| `./orpc-tanstack-util` | `orpc` object with `.queryOptions()` and `.mutationOptions()` |

## QueryClient Configuration

```typescript
// src/query-client.ts
import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { serializer } from "./lib/serializer";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60s before refetch
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        serializeData: serializer.serialize,
      },
      hydrate: {
        deserializeData: serializer.deserialize,
      },
    },
    queryKeyHashFn: (queryKey) => {
      return JSON.stringify(queryKey, (_, value) => serializer.serialize(value));
    },
  });
```

Key configuration:
- **`staleTime: 60s`** - Prevents immediate refetches on component mount. Data is considered fresh for 60 seconds.
- **Custom serializer** - oRPC uses complex query keys (objects, not just strings). The `StandardRPCJsonSerializer` handles serialization of Dates, BigInts, and other non-JSON types.
- **Dehydrate pending queries** - Serializes in-flight server queries so the client can pick them up.

## Server-Side Hydration

```typescript
// src/hydration.tsx
import { cache } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";

// One QueryClient per server request (React cache)
export const getQueryClient = cache(createQueryClient);

// Wraps children with serialized query state
export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
```

How server-side hydration works:
1. Server component calls `getQueryClient()` -- gets a per-request QueryClient (React's `cache()` ensures one per request)
2. Server component calls `queryClient.prefetchQuery(orpc.tasks...queryOptions())`
3. oRPC server client runs the procedure directly (no HTTP)
4. Data is stored in the QueryClient's cache
5. `HydrateClient` serializes the cache via `dehydrate()` and embeds it in the HTML
6. Client-side `HydrationBoundary` deserializes the data into the client QueryClient
7. `useSuspenseQuery` picks up the data without any loading state

## oRPC TanStack Utils

```typescript
// src/orpc-tanstack-util.ts
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "@workspace/rpc/orpc/orpc.server";

export const orpc = createTanstackQueryUtils(client);
```

This `orpc` object mirrors the router structure and provides TanStack Query helpers for every procedure:

```typescript
// Query options for useSuspenseQuery / useQuery
orpc.tasks.getUserTasksWithCount.queryOptions()
orpc.billing.getSubscription.queryOptions()

// Mutation options for useMutation
orpc.tasks.create.mutationOptions()
orpc.tasks.update.mutationOptions()

// Query key for cache invalidation
orpc.tasks.getUserTasksWithCount.queryOptions().queryKey
```

## Usage in Apps

### Server Component (prefetch)

```typescript
// app/dashboard/tasks/page.tsx
import { getQueryClient, HydrateClient } from "@workspace/data-layer/hydration";
import { orpc } from "@workspace/data-layer/orpc-tanstack-util";

export default async function TasksPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.tasks.getUserTasksWithCount.queryOptions());

  return (
    <HydrateClient>
      <TasksContent />
    </HydrateClient>
  );
}
```

### Client Component (consume + mutate)

```typescript
// components/tasks/tasks-content.tsx ("use client")
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@workspace/data-layer/orpc-tanstack-util";

export function TasksContent() {
  // Data already in cache from server prefetch
  const { data } = useSuspenseQuery(orpc.tasks.getUserTasksWithCount.queryOptions());

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(orpc.tasks.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.tasks.getUserTasksWithCount.queryOptions().queryKey,
      });
    },
  }));

  // ...
}
```

## Custom Serializer

oRPC uses `StandardRPCJsonSerializer` for complex types:

```typescript
// src/lib/serializer.ts
import { StandardRPCJsonSerializer } from "@orpc/client/standard";

export const serializer = new StandardRPCJsonSerializer();
```

This handles:
- `Date` objects (serialized as ISO strings, deserialized back to `Date`)
- `BigInt` values
- Complex nested objects in query keys

## Dependencies

```json
{
  "@orpc/client": "^1.13.13",
  "@orpc/tanstack-query": "catalog:data-layer",
  "@tanstack/react-query": "catalog:data-layer",
  "@workspace/rpc": "workspace:*",
  "react": "catalog:web",
  "react-dom": "catalog:web"
}
```

## Related

- [App (Dashboard)](/apps/app) - How the dashboard uses the data layer
- [RPC Package](/packages/rpc) - The oRPC procedures the data layer wraps
- [Clean Architecture](/architecture/clean-architecture) - Where Data Layer sits
