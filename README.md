# Cracked Template

An opinionated B2B SaaS monorepo built with Bun, Turborepo, Next.js, React, oRPC, Drizzle, and TanStack Query. The repo includes a product app, docs, mobile starter, marketing site variants, shared packages, and infrastructure wiring for auth, billing, analytics, jobs, and observability.

[Docs](https://orion-kit-docs.vercel.app/) | [Architecture](https://orion-kit-docs.vercel.app/architecture/overview) | [Packages](https://orion-kit-docs.vercel.app/packages)

## What is in this repo

```txt
apps/
  app/                         Next.js product app, dashboard, API routes, oRPC endpoint
  docs/                        Astro Starlight documentation site
  email-preview/               React Email preview launcher
  mobile/                      Expo Router mobile app starter
  studio/                      Drizzle Studio launcher
  marketing-websites/
    brutalism/                 Next.js marketing page variant
    futuristic-ai/             Next.js marketing page variant

packages/
  analytics/                   PostHog, Vercel Analytics, event structure
  auth/                        Better Auth server/client/provider wiring
  core/                        Use cases and authorization rules
  data-layer/                  TanStack Query client, hydration, oRPC query utilities
  database/                    Drizzle schema, PostgreSQL client, migrations, seed scripts
  email/                       React Email templates
  jobs/                        Trigger.dev task configuration
  observability/               Sentry and OpenTelemetry integration helpers
  payment/                     Stripe client, server helpers, pricing, webhooks
  repository/                  Data-access entities around Drizzle
  rpc/                         oRPC routers, procedures, middleware, client setup
  types/                       Shared contracts, errors, repository and use-case types
  typescript-config/           Shared TypeScript configs
  ui/                          Shared UI components, hooks, styles, auth UI helpers
```

## Apps

| App | Path | Local port | Notes |
| --- | --- | --- | --- |
| Product app | `apps/app` | `3001` | Next.js app with auth, dashboard, tasks, billing, analytics, settings, API routes, Stripe webhooks, and `/rpc`. |
| Docs | `apps/docs` | `3004` | Astro Starlight docs. Source lives in `apps/docs/src/content/docs`. |
| Email preview | `apps/email-preview` | `3004` | Starts React Email from `packages/email`; run separately from docs because they share a default port. |
| Mobile | `apps/mobile` | Expo default | Expo Router app with Better Auth integration and a local Prisma/SQLite starter. |
| Studio | `apps/studio` | `3003` | Runs Drizzle Studio against `packages/database`. |
| Brutalism marketing | `apps/marketing-websites/brutalism` | `3005` | Standalone Next.js marketing page. |
| Futuristic AI marketing | `apps/marketing-websites/futuristic-ai` | `3006` | Standalone Next.js marketing page with animated UI pieces. |

There is no standalone `apps/api` or `apps/web` in this checkout. The API surface currently lives inside `apps/app`:

- `apps/app/app/api/auth/[...all]/route.ts` for Better Auth
- `apps/app/app/api/webhooks/stripe/route.ts` for Stripe webhooks
- `apps/app/app/api/health/route.ts` for health checks
- `apps/app/app/rpc/[[...rest]]/route.ts` for oRPC

## Architecture

```txt
apps/app
  -> packages/data-layer      TanStack Query hydration and oRPC query helpers
  -> packages/rpc             routers, procedures, auth/error middleware
  -> packages/core            use cases and authorization
  -> packages/repository      database entity access
  -> packages/database        Drizzle schema and PostgreSQL client
  -> packages/types           shared contracts and errors
```

Feature packages such as `auth`, `payment`, `analytics`, `observability`, `jobs`, `email`, and `ui` plug into the app without requiring app code to own those integrations directly.

## Prerequisites

- Node.js 20 or newer
- Bun 1.3.10 or newer
- Docker, if you want to use the local PostgreSQL container in `packages/database/docker-compose.yml`

## Quick start

```bash
bun install
```

Create local env files:

```bash
cp apps/app/.env.example apps/app/.env.local
cp packages/database/env.example packages/database/.env
cp packages/jobs/env.example packages/jobs/.env
```

For local development with the bundled PostgreSQL container, use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/nextjs-boilerplate
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=replace-with-a-local-secret
```

Optional integrations can be filled in as needed:

- Google OAuth: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO`, `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE`, `NEXT_PUBLIC_APP_URL`
- Analytics: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Observability: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- Jobs: `TRIGGER_PROJECT`

Start the local database, push the schema, then run the app:

```bash
bun --filter @workspace/database dev
bun --filter @workspace/database db:push
bun --filter @workspace/app dev
```

Open [http://localhost:3001](http://localhost:3001).

## Common commands

```bash
bun dev                         # Run every workspace dev script
bun build                       # Build all workspaces through Turbo
bun typecheck                   # Type-check all packages/apps
bun test                        # Run Vitest
bun check                       # Run Ultracite checks with fixes
bun fix                         # Run Ultracite fix

bun --filter @workspace/app dev          # Product app
bun --filter @workspace/docs dev         # Docs
bun --filter @workspace/studio dev       # Drizzle Studio
bun --filter @workspace/brutalism dev    # Brutalism marketing page
bun --filter @workspace/futuristic dev   # Futuristic AI marketing page
bun --filter @workspace/email-preview dev # React Email preview
bun --filter mobile start                # Expo app

bun --filter @workspace/database db:generate
bun --filter @workspace/database db:migrate
bun --filter @workspace/database db:push
bun --filter @workspace/database db:studio
bun --filter @workspace/database db:seed
```

## Documentation

The local docs app is in `apps/docs`, with pages under `apps/docs/src/content/docs`.

Useful starting points:

- [Introduction](https://orion-kit-docs.vercel.app/introduction/)
- [Architecture overview](https://orion-kit-docs.vercel.app/architecture/overview/)
- [Clean architecture](https://orion-kit-docs.vercel.app/architecture/clean-architecture/)
- [Applications](https://orion-kit-docs.vercel.app/apps/)
- [Packages](https://orion-kit-docs.vercel.app/packages/)

## Notes for contributors

- Use the package boundaries: app code should go through `data-layer`, `rpc`, `core`, and `repository` instead of calling the database directly.
- Shared UI belongs in `packages/ui`; app-specific flows belong in `apps/app/components`.
- Keep environment validation in each package's `keys.ts` close to the package that owns the integration.
- Marketing pages are independent workspace apps under `apps/marketing-websites`.

## License

MIT
