"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AnalyticsProvider } from "@workspace/analytics/provider";
import { AuthProvider } from "@workspace/auth/provider";
import { createQueryClient } from "@workspace/data-layer/client";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import {
  createAppMutationCache,
  createAppQueryCache,
} from "@/lib/client-error-handler";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    createQueryClient({
      queryCache: createAppQueryCache(),
      mutationCache: createAppMutationCache(),
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </AnalyticsProvider>
    </QueryClientProvider>
  );
}
