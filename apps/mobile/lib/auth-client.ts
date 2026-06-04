import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
// biome-ignore lint/performance/noNamespaceImport: the entire module must be passed as the expo client storage param (came with default app)
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8081",
  disableDefaultFetchPlugins: true,
  plugins: [
    expoClient({
      scheme: "exp",
      storagePrefix: "withbetterauth",
      storage: SecureStore,
    }),
  ],
});
