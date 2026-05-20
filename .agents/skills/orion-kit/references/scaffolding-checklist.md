# Scaffolding Checklist — Full Code Templates

Complete templates for adding a new entity across all 7 layers.
Replace `<entity>` / `<Entity>` / `<entities>` / `<Entities>` with your
actual entity name (e.g. `note` / `Note` / `notes` / `Notes`).

---

## Step 1 — Database Schema

**File:** `packages/database/src/schema.ts`

Add the enum (if needed) and table. Add the table to the `schema` export object.

```ts
// 1a. Add enum (optional — only if the entity has a status/type field)
export const <entity>StatusEnum = pgEnum("<entity>_status", [
  "active",
  "archived",
  "deleted",
]);

// 1b. Add table
export const <entities> = pgTable("<entities>", {
  id:        uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId:    varchar("user_id", { length: 255 }).notNull(),

  title:     varchar({ length: 255 }).notNull(),
  content:   text(),
  status:    <entity>StatusEnum().default("active").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 1c. Register in schema export at bottom of file
export const schema = {
  subscription,
  tasks,
  users,
  <entities>,   // ← add here
};
```

**Then run:**
```bash
cd packages/database && bun db:generate && bun db:migrate
```

---

## Step 2 — Repository Types

**File:** `packages/types/src/repository/<entity>.ts` *(new file)*

```ts
import { createInsertSchema, createUpdateSchema } from "@workspace/database/drizzle-zod";
import { <entities> } from "@workspace/database/schema";
import { z } from "zod";
import { listBaseParamsSchema } from "./base";

export const create<Entity>InputSchema = createInsertSchema(<entities>);
export const update<Entity>InputSchema = createUpdateSchema(<entities>).extend({
  id: z.string().uuid(),
});
export const get<Entity>InputSchema    = z.object({ id: z.string() });
export const list<Entities>ParamsSchema = listBaseParamsSchema.extend({
  userId: z.string(),
});
export const delete<Entity>ParamsSchema = z.object({ id: z.string() });

export type <Entity>RawObject    = typeof <entities>.$inferSelect;

export type Create<Entity>Params = z.infer<typeof create<Entity>InputSchema>;
export type Update<Entity>Params = z.infer<typeof update<Entity>InputSchema>;
export type Get<Entity>Params    = z.infer<typeof get<Entity>InputSchema>;
export type List<Entities>Params = z.infer<typeof list<Entities>ParamsSchema>;
export type Delete<Entity>Params = z.infer<typeof delete<Entity>ParamsSchema>;
```

---

## Step 3 — Use Case Types

**File:** `packages/types/src/use-cases/<entity>.ts` *(new file)*

```ts
import { z } from "zod";
import type { <Entity>RawObject } from "../repository/<entity>";

export type <Entity> = <Entity>RawObject;

export const create<Entity>InputSchema = z.object({
  title:   z.string().min(1),
  content: z.string().nullable().optional(),
});

export const update<Entity>InputSchema = z.object({
  id:      z.string().uuid(),
  title:   z.string().min(1).optional(),
  content: z.string().nullable().optional(),
  status:  z.enum(["active", "archived", "deleted"]).optional(),
});

export const delete<Entity>InputSchema = z.object({
  id: z.string().uuid(),
});

export type Create<Entity>Input = z.infer<typeof create<Entity>InputSchema>;
export type Update<Entity>Input = z.infer<typeof update<Entity>InputSchema>;
export type Delete<Entity>Input = z.infer<typeof delete<Entity>InputSchema>;
```

---

## Step 4 — Repository

**File:** `packages/repository/src/entities/<entity>.ts` *(new file)*

```ts
import { and, db, desc, eq, ilike, or } from "@workspace/database/client";
import { <entities> } from "@workspace/database/schema";
import { HttpError } from "@workspace/types/errors/http";
import type {
  Create<Entity>Params, Delete<Entity>Params,
  Get<Entity>Params, List<Entities>Params,
  <Entity>RawObject, Update<Entity>Params,
} from "@workspace/types/repository/<entity>";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUM  = 1;

const buildSearchClause = (search?: string) => {
  if (!search) return undefined;
  return or(
    ilike(<entities>.title,   `%${search}%`),
    ilike(<entities>.content, `%${search}%`)
  );
};

export const list = async (params: List<Entities>Params) => {
  const { userId, search, pageNum = DEFAULT_PAGE_NUM, pageSize = DEFAULT_PAGE_SIZE } = params;
  const whereClause = and(eq(<entities>.userId, userId), buildSearchClause(search));
  const offset      = (pageNum - 1) * pageSize;

  const [data] = await Promise.all([
    db.query.<entities>.findMany({
      where: whereClause,
      orderBy: desc(<entities>.createdAt),
      limit: pageSize,
      offset,
    }),
    // include count query here if needed
  ]);

  return data;
};

export const get = async (params: Get<Entity>Params): Promise<<Entity>RawObject> => {
  const { id } = params;
  const entity = await db.query.<entities>.findFirst({ where: eq(<entities>.id, id) });
  if (!entity) throw new HttpError(404, "<Entity> not found");
  return entity;
};

export const create = async (params: Create<Entity>Params): Promise<<Entity>RawObject> => {
  const { userId, ...data } = params;
  const result = await db.insert(<entities>).values({ ...data, userId }).returning();
  const entity = result[0];
  if (!entity) throw new HttpError(500, "Failed to create <entity>");
  return entity;
};

export const updateOne = async (params: Update<Entity>Params): Promise<<Entity>RawObject> => {
  const { id, ...data } = params;
  const result = await db.update(<entities>).set({ ...data, updatedAt: new Date() }).where(eq(<entities>.id, id)).returning();
  const entity = result[0];
  if (!entity) throw new HttpError(404, "<Entity> not found");
  return entity;
};

export const deleteOne = async (params: Delete<Entity>Params): Promise<<Entity>RawObject> => {
  const { id } = params;
  const result = await db.delete(<entities>).where(eq(<entities>.id, id)).returning();
  const entity = result[0];
  if (!entity) throw new HttpError(404, "<Entity> not found");
  return entity;
};
```

---

## Step 5 — Authorization

**File:** `packages/core/src/authorization/<entity>.ts` *(new file)*

```ts
import { HttpError } from "@workspace/types/errors/http";
import type { <Entity>RawObject } from "@workspace/types/repository/<entity>";

export const assert<Entity>Ownership = (
  entity: <Entity>RawObject,
  userId: string
): void => {
  if (entity.userId !== userId) {
    throw new HttpError(403, "Forbidden");
  }
};
```

---

## Step 6 — Use Cases

**File:** `packages/core/src/use-cases/<entity>.ts` *(new file)*

```ts
import * as <entity>Repository from "@workspace/repository/entities/<entity>";
import type { <Entity>RawObject } from "@workspace/types/repository/<entity>";
import { assert<Entity>Ownership } from "../authorization/<entity>";

export const getUser<Entities> = async (params: { userId: string }) => {
  return await <entity>Repository.list({ userId: params.userId });
};

export const create<Entity> = async (params: {
  userId: string;
  title: string;
  content?: string | null;
}) => {
  const { userId, title, content } = params;
  return <entity>Repository.create({ userId, title, content: content ?? null });
};

export const update<Entity> = async (params: {
  userId: string;
  entityId: string;
  data: { title?: string; content?: string | null; status?: <Entity>RawObject["status"] };
}) => {
  const { userId, entityId, data } = params;
  const entity = await <entity>Repository.get({ id: entityId });
  assert<Entity>Ownership(entity, userId);
  return <entity>Repository.updateOne({ id: entityId, ...data });
};

export const delete<Entity> = async (params: { userId: string; entityId: string }) => {
  const { userId, entityId } = params;
  const entity = await <entity>Repository.get({ id: entityId });
  assert<Entity>Ownership(entity, userId);
  return <entity>Repository.deleteOne({ id: entityId });
};
```

---

## Step 7 — RPC Router

**File:** `packages/rpc/src/routers/<entity>.ts` *(new file)*

```ts
import { create<Entity>, delete<Entity>, getUser<Entities>, update<Entity> } from "@workspace/core/use-cases/<entity>";
import {
  create<Entity>InputSchema,
  delete<Entity>InputSchema,
  update<Entity>InputSchema,
} from "@workspace/types/use-cases/<entity>";
import { authenticatedProcedure } from "../procedures";

const <entity>Router = {
  list: authenticatedProcedure.handler(async ({ context }) => {
    return await getUser<Entities>({ userId: context.user.id });
  }),

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

export default <entity>Router;
```

---

## Step 8 — Register Router

**File:** `packages/rpc/src/index.ts` *(edit existing)*

```ts
import <entity>Router from "./routers/<entity>";   // add this import

export const router = {
  // ...existing routers...
  <entities>: <entity>Router,   // add this line
};
```

---

## Step 9 — Page

**File:** `apps/app/app/dashboard/<entities>/page.tsx` *(new file)*

```tsx
import { getQueryClient, HydrateClient } from "@workspace/data-layer/hydration";
import { orpc } from "@workspace/data-layer/orpc-tanstack-util";
import { Suspense } from "react";
import { Create<Entity>Dialog } from "@/components/<entities>/create-<entity>-dialog";
import { Edit<Entity>Sheet }    from "@/components/<entities>/edit-<entity>-sheet";
import { <Entities>Content }    from "@/components/<entities>/<entities>-content";
import { <Entities>Loading }    from "@/components/<entities>/<entities>-loading";
import { <Entities>Provider }   from "@/components/<entities>/context";

export default async function <Entities>Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(orpc.<entities>.list.queryOptions());

  return (
    <<Entities>Provider>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl"><Entities></h1>
            <p className="text-muted-foreground">Manage your <entities></p>
          </div>
          <Create<Entity>Dialog />
        </div>
        <Suspense fallback={<<Entities>Loading />}>
          <HydrateClient client={queryClient}>
            <<Entities>Content />
          </HydrateClient>
        </Suspense>
        <Edit<Entity>Sheet />
      </div>
    </<Entities>Provider>
  );
}
```

---

## Step 10 — Component Folder

Create `apps/app/components/<entities>/` with these files:

### `context.tsx`
See `references/layer-app.md` → Context File section for the full template.

### `mutations.ts`

```ts
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { orpc } from "@workspace/data-layer/orpc-tanstack-util";
import { toast } from "sonner";

export function update<Entity>(queryClient: QueryClient) {
  return orpc.<entities>.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.<entities>.list.key() });
      toast.success("<Entity> updated successfully!");
    },
  });
}

export function delete<Entity>(queryClient: QueryClient) {
  return orpc.<entities>.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.<entities>.list.key() });
      toast.success("<Entity> deleted successfully!");
    },
  });
}

export function create<Entity>(queryClient: QueryClient) {
  return orpc.<entities>.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.<entities>.list.key() });
      toast.success("<Entity> created successfully!");
    },
  });
}
```

### `<entities>-content.tsx`

```tsx
"use client";

import { orpc } from "@workspace/data-layer/orpc-tanstack-util";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { update<Entity> as update<Entity>Mutation } from "@/components/<entities>/mutations";
import { use<Entities>Context } from "./context";

export function <Entities>Content() {
  const queryClient = useQueryClient();
  const { currentPage, itemsPerPage } = use<Entities>Context();

  const { data } = useSuspenseQuery(orpc.<entities>.list.queryOptions());
  const { mutateAsync } = useMutation(update<Entity>Mutation(queryClient));

  const items = data ?? [];

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {/* render item */}
        </div>
      ))}
    </div>
  );
}
```

### `<entities>-loading.tsx`

```tsx
export function <Entities>Loading() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
        <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}
```

### `create-<entity>-dialog.tsx`
See `references/layer-app.md` → Dialog / Form Pattern for the full template.
