---
title: Studio
description: Drizzle Studio for database browsing and management
---

The studio application (`apps/studio`) runs Drizzle Studio, a web-based GUI for browsing and editing the PostgreSQL database. You can also use the Neon dashboard for the same purpose.

**Tool:** Drizzle Studio (via drizzle-kit)
**Port:** 3003
**Access:** Local development only
**Database:** Neon PostgreSQL

## Technology

Drizzle Studio is part of `drizzle-kit`. It connects to the database using the `DATABASE_URL` and provides a browser interface for viewing tables, editing rows, and running queries.

## Data Layer

Direct database connection via `DATABASE_URL`. No application layer -- Studio reads and writes the database directly.

## Structure

```
apps/studio/
├── drizzle.config.ts    # Database connection config
├── package.json         # Scripts: dev runs drizzle-kit studio
└── tsconfig.json
```

Minimal on purpose. The schema is defined in `@workspace/database`, not here.

## Configuration

```typescript
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Usage

```bash
# From root
bun db:studio

# Or directly
cd apps/studio && bun dev
```

Opens at `https://local.drizzle.studio?port=3003`

## Database Schema

Studio displays the tables defined in `@workspace/database/schema`:

| Table | Purpose |
| ----- | ------- |
| `users` | User accounts (id, name, email, password, timestamps) |
| `subscription` | Stripe billing (plan, stripe customer/subscription IDs, status) |
| `tasks` | User tasks (title, description, status, due date, timestamps) |

## Common Workflows

### Inspect data after seeding

```bash
bun db:seed     # Seed the database
bun db:studio   # View the data
```

### Apply schema changes

```bash
# 1. Edit packages/database/src/schema.ts
# 2. Push to dev database
bun db:push
# 3. View changes in Studio
bun db:studio
```

### Generate and apply migrations

```bash
bun db:generate  # Create migration SQL
bun db:migrate   # Apply to database
```

## Related

- [Database Package](/packages/database) - Schema definitions and client
- [API Application](/apps/api) - The app that reads/writes via the package layers
