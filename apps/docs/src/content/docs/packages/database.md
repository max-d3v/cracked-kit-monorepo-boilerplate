---
title: Database
description: Drizzle ORM schema, Neon PostgreSQL client, migrations, and seeding
---

The Database package (`@workspace/database`) defines the PostgreSQL schema with Drizzle ORM and provides the database client connected to Neon. It is the foundation of the data layer -- all types are inferred from the schema, and all queries go through the Drizzle client.

**ORM:** Drizzle ORM
**Database:** Neon PostgreSQL (serverless)
**Layer:** Infrastructure
**Consumed by:** `@workspace/repository`

## Package Exports

```json
{
  "exports": {
    "./client": "./src/client.ts",
    "./schema": "./src/schema.ts",
    "./drizzle-zod": "./src/drizzle-zod.ts",
    "./keys": "./src/keys.ts"
  }
}
```

| Export | Purpose |
| ------ | ------- |
| `./client` | Drizzle client instance (`db`) |
| `./schema` | Table definitions, enums, relations |
| `./drizzle-zod` | Re-export of drizzle-zod for schema-to-Zod |
| `./keys` | t3-env validation for `DATABASE_URL` |

## Schema

### Task Status Enum

```typescript
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "completed",
  "cancelled",
]);
```

### Users Table

```typescript
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified"),
  image: varchar({ length: 255 }),
  password: varchar({ length: 255 }),
  welcomeMailSent: boolean("welcome_mail_sent").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Subscription Table

```typescript
export const subscription = pgTable("subscription", {
  id: uuid().primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).unique().notNull(),

  // Stripe billing
  plan: varchar({ length: 50 }).default("free"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeSubscriptionStatus: varchar("stripe_subscription_status", { length: 50 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Tasks Table

```typescript
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

## Client

```typescript
// src/client.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { env } from "./keys";

const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
```

Uses Neon's HTTP adapter for serverless-friendly connections. No persistent connection pool -- each query is a standalone HTTP request.

## Database Commands

```bash
# Generate migration from schema changes
bun db:generate

# Apply migrations to database
bun db:migrate

# Push schema directly (development)
bun db:push

# Pull schema from database
bun db:pull

# Open Drizzle Studio
bun db:studio

# Seed database with test data
bun db:seed

# Check schema status
bun db:check
```

## Seeding

The seed file creates a demo user with preferences and 40+ sample tasks:

```bash
bun db:seed
```

Seeds include tasks across all statuses (todo, in-progress, completed, cancelled) with realistic titles and descriptions for development.

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

Validated via t3-env. Must be a valid PostgreSQL connection string.

## Dependencies

```json
{
  "drizzle-orm": "catalog:schemas",
  "drizzle-zod": "catalog:schemas",
  "@neondatabase/serverless": "^0.10.4",
  "zod": "catalog:schemas"
}
```

## Related

- [Repository Package](/packages/repository) - Uses the database client and schema
- [Type System](/architecture/type-system) - How types are inferred from the schema
- [Studio Application](/apps/studio) - Drizzle Studio for browsing data
