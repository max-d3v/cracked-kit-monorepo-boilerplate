// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
  outDir: "dist",
  build: {
    inlineStylesheets: "auto",
  },
  integrations: [
    starlight({
      title: "Cracked Template",

      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Mumma6/orion-kit",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "introduction" },
            { label: "Quick Start", slug: "quick-start" },
            { label: "Learning Paths", slug: "learning-paths" },
            { label: "Customization", slug: "getting-started/customization" },
            { label: "Deployment", slug: "getting-started/deployment" },
            {
              label: "Feature Integration",
              slug: "getting-started/integrations",
            },
            {
              label: "Troubleshooting",
              slug: "getting-started/troubleshooting",
            },
          ],
        },
        {
          label: "Architecture",
          items: [
            {
              label: "Monorepo Overview",
              slug: "architecture/overview",
            },
            {
              label: "Clean Architecture",
              slug: "architecture/clean-architecture",
            },
            {
              label: "Type System",
              slug: "architecture/type-system",
            },
          ],
        },
        {
          label: "Applications",
          items: [
            { label: "Overview", slug: "apps" },
            { label: "App (Dashboard)", slug: "apps/app" },
            { label: "API (oRPC Server)", slug: "apps/api" },
            { label: "Web (Landing)", slug: "apps/web" },
            { label: "Studio", slug: "apps/studio" },
            { label: "Docs", slug: "apps/docs" },
          ],
        },
        {
          label: "Core Packages",
          items: [
            { label: "Overview", slug: "packages" },
            { label: "RPC", slug: "packages/rpc" },
            { label: "Core (Use Cases)", slug: "packages/core" },
            { label: "Repository", slug: "packages/repository" },
            { label: "Data Layer", slug: "packages/data-layer" },
            { label: "Auth", slug: "packages/auth" },
            { label: "Database", slug: "packages/database" },
            { label: "Types", slug: "packages/types" },
          ],
        },
        {
          label: "Auxiliary Packages",
          items: [
            { label: "UI", slug: "packages/ui" },
            { label: "Analytics", slug: "packages/analytics" },
            { label: "Observability", slug: "packages/observability" },
            { label: "Payment", slug: "packages/payment" },
            { label: "Email", slug: "packages/email" },
            { label: "Jobs", slug: "packages/jobs" },
          ],
        },
        {
          label: "Complete Guide",
          items: [
            { label: "Accounts Setup", slug: "guide/accounts-setup" },
            {
              label: "Environment Variables",
              slug: "guide/environment-variables",
            },
            { label: "Deployment", slug: "guide/deployment" },
            { label: "Forms", slug: "guide/forms" },
            { label: "Error Handling", slug: "guide/error-handling" },
            { label: "TanStack Query", slug: "guide/tanstack-query" },
            { label: "Zod Validation", slug: "guide/zod" },
            { label: "Stripe Payments", slug: "guide/stripe-payments" },
            { label: "Testing", slug: "guide/testing" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Integrations Overview", slug: "reference/integrations" },
            { label: "Adding AI Features", slug: "reference/integrations/ai" },
            { label: "Adding Auth", slug: "reference/integrations/auth" },
            { label: "Adding i18n", slug: "reference/integrations/i18n" },
            {
              label: "Adding File Uploads",
              slug: "reference/integrations/file-uploads",
            },
            { label: "Adding CMS", slug: "reference/integrations/cms" },
            {
              label: "Adding Real-time",
              slug: "reference/integrations/realtime",
            },
            { label: "Adding Search", slug: "reference/integrations/search" },
          ],
        },
      ],
    }),
  ],
});
