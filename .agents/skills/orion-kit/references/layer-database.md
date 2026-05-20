# Layer 1: Database

**Package:** `@workspace/database`
**Purpose:** Drizzle ORM schema definitions, database client, and Zod schema
generators. Nothing above this layer interacts with Postgres directly.

## Exports

```json
"./client"     → src/client.ts        (Drizzle db instance + query helpers)
"./schema"     → src/schema.ts        (all table definitions + enums)
"./drizzle-zod" → src/drizzle-zod.ts  (createInsertSchema, createUpdateSchema)
"./keys"       → src/keys.ts          (t3-env DATABASE_URL validation)
```

## Table Definition Pattern

Source: `packages/database/src/schema.ts`

```ts
import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// 1. Define enums first (referenced by table columns)
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "completed",
  "cancelled",
]);

// 2. Define the table
export const tasks = pgTable("tasks", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),   // Clerk user ID

  title: varchar({ length: 255 }).notNull(),
  description: text(),
  status: taskStatusEnum().default("todo").notNull(),

  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Register in the schema export object at bottom of file
export const schema = {
  subscription,
  tasks,
  users,
  // add new table here ↑
};
```

## Key Conventions

- **Primary key:** always `uuid().default(sql\`gen_random_uuid()\`).primaryKey()`
- **User ownership:** always `varchar("user_id", { length: 255 }).notNull()` (Clerk user ID is a string)
- **Timestamps:** `createdAt` and `updatedAt` are always present; set `updatedAt: new Date()` manually in `updateOne` in the repository
- **Enums:** define with `pgEnum` before the table; use snake_case for DB name, camelCase for TS variable name
- **Text vs varchar:** use `text()` for unbounded strings (description, body); `varchar({ length: N })` for bounded strings

## Migration Workflow

```bash
# After editing schema.ts:
cd packages/database
bun db:generate   # creates migration file in drizzle/
bun db:migrate    # applies to Neon database
```

## What Goes Here

Only Drizzle table definitions and the database client. No business logic, no
Zod schemas (those go in `packages/types`), no query functions (those go in
`packages/repository`).
