import { vi } from "vitest";

/**
 * Re-imports a module after stubbing env vars, for modules that read their
 * config when first evaluated. Pass the import from the test file so the path
 * resolves relative to it: `importWithEnv(env, () => import("../src/server"))`.
 */
export const importWithEnv = async <T>(
  env: Record<string, string>,
  load: () => Promise<T>
): Promise<T> => {
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  vi.resetModules();
  return await load();
};
