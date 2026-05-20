---
title: Repository
description: Data access layer with Drizzle ORM queries, search, and pagination
---

The Repository package (`@workspace/repository`) is the data access layer. It translates business operations into Drizzle ORM queries. No business logic, no authorization -- just database operations with filtering, search, and pagination.

**Layer:** Data Access
**ORM:** Drizzle ORM
**Depends on:** `@workspace/database`, `@workspace/types`
**Consumed by:** `@workspace/core`

## Package Exports

```json
{
  "exports": {
    "./entities/*": "./src/entities/*.ts"
  }
}
```

Import example: `import * as tasksRepository from "@workspace/repository/entities/tasks"`

## Structure

```
packages/repository/src/
└── entities/
    ├── tasks.ts              # Task CRUD + search + pagination
    ├── users.ts              # User CRUD + search + pagination
    └── subscription.ts       # Subscription CRUD + getOrCreate
```

Each entity file exports standalone async functions. No classes, no dependency injection -- just functions that use the shared database client.

## Entity: Tasks

```typescript
// src/entities/tasks.ts

export const list = async ({ userId, search, pageNum = 1, pageSize = 50 }) => {
  return db.query.tasks.findMany({
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
};

export const get = async (id: string) => {
  const task = await db.query.tasks.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
  });
  if (!task) throw new HttpError(404, "Task not found");
  return task;
};

export const find = async (id: string) => {
  return db.query.tasks.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
  });
};

export const create = async (params: CreateTaskParams) => {
  const [task] = await db.insert(tasks).values(params).returning();
  return task;
};

export const updateOne = async (id: string, data: UpdateTaskParams) => {
  const [task] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new HttpError(404, "Task not found");
  return task;
};

export const deleteOne = async (id: string) => {
  const [task] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new HttpError(404, "Task not found");
  return task;
};
```

## Entity: Users

```typescript
// src/entities/users.ts

export const list = async ({ search, pageNum, pageSize }) => { ... };
export const get = async (id: string) => { ... };
export const getByEmail = async (email: string) => { ... };
export const create = async (params: CreateUserParams) => { ... };
export const updateOne = async (id: string, data: UpdateUserParams) => { ... };
export const deleteOne = async (id: string) => { ... };
```

Same pattern: CRUD + search + pagination. Users can be searched by name or email using `ilike`.

## Entity: Subscription

```typescript
// src/entities/subscription.ts

export const get = async ({ userId }) => { ... };

// Creates a default (free) subscription record if none exists
export const getOrCreate = async ({ userId }) => {
  const existing = await get({ userId });
  if (existing) return existing;
  return create({ userId });
};

export const create = async ({ userId }) => { ... };
export const updateOne = async (userId, data) => { ... };
export const deleteOne = async (userId) => { ... };
```

The `getOrCreate` pattern handles first-time users who don't have a subscription record yet.

## Query Patterns

### Search with ilike

```typescript
// Case-insensitive search across multiple columns
if (search) {
  conditions.push(
    or(
      ilike(fields.title, `%${search}%`),
      ilike(fields.description, `%${search}%`)
    )
  );
}
```

### Pagination

```typescript
// Offset-based pagination
limit: pageSize,
offset: (pageNum - 1) * pageSize,
```

### Error Handling

Repository functions throw `HttpError` for not-found cases:

```typescript
if (!task) throw new HttpError(404, "Task not found");
```

The core layer catches these or lets them bubble up to the RPC layer, which returns them as structured error responses.

## Design Principles

1. **No business logic.** The repository doesn't check ownership, validate business rules, or compose data from multiple tables. That's the core layer's job.

2. **One entity per file.** Each file exports all operations for a single database table.

3. **Type-safe inputs and outputs.** Parameter types and return types are defined in `@workspace/types/repository/*`.

4. **Drizzle query builder.** Uses Drizzle's relational query API (`db.query.*.findMany`) for reads and the insert/update/delete builders for writes.

## Dependencies

```json
{
  "@workspace/database": "workspace:*",
  "@workspace/types": "workspace:*"
}
```

## Related

- [Clean Architecture](/architecture/clean-architecture) - Where Repository sits in the layers
- [Core Package](/packages/core) - The business logic layer that calls Repository
- [Database Package](/packages/database) - The schema and client Repository uses
