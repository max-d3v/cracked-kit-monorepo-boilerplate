import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const appDir = fileURLToPath(new URL("./apps/app/", import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
    // Every test starts from a clean slate: mock implementations/calls and
    // stubbed env vars are reset between tests.
    mockReset: true,
    unstubEnvs: true,
    // Deterministic env for modules that read config at import time
    // (t3-env treats "" as undefined). Real secrets never reach the tests.
    env: {
      NEXT_PUBLIC_STRIPE_PRICE_ID_PRO: "price_test_pro",
      NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE: "price_test_enterprise",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_APP_URL: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      NEXT_PUBLIC_POSTHOG_KEY: "",
      NEXT_PUBLIC_POSTHOG_HOST: "",
    },
    projects: [
      {
        extends: true,
        test: {
          name: "packages",
          // Also picks up tests in every app except apps/app, which has its
          // own project for the `@/` alias, so a new app's tests always run.
          include: [
            "packages/**/__tests__/**/*.{test,spec}.{js,ts,tsx}",
            "apps/**/__tests__/**/*.{test,spec}.{js,ts,tsx}",
          ],
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.next/**",
            "apps/app/**",
          ],
        },
      },
      {
        extends: true,
        resolve: {
          // Mirror the `@/*` path alias from apps/app/tsconfig.json.
          alias: [{ find: /^@\//, replacement: appDir }],
        },
        test: {
          name: "app",
          include: ["apps/app/**/__tests__/**/*.{test,spec}.{js,ts,tsx}"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "**/dist/**",
        "**/.next/**",
      ],
    },
  },
});
