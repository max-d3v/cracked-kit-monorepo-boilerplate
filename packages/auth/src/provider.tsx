"use client";

import { AuthProvider as DefaultAuthProvider } from "@workspace/ui/components/auth/auth-provider";
import { organizationPlugin } from "@workspace/ui/lib/auth/organization-plugin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { authClient } from "./client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <DefaultAuthProvider
      appearance={{ theme, setTheme }}
      authClient={authClient}
      deleteUser={{ enabled: true }}
      Link={Link}
      magicLink
      multiSession
      navigate={({ to, replace }) =>
        replace ? router.replace(to) : router.push(to)
      }
      plugins={[organizationPlugin()]}
      redirectTo="/dashboard"
      socialProviders={["google"]}
      viewPaths={{
        settings: {
          account: "account/profile",
          organizations: "account/organizations",
          security: "account/security",
        },
      }}
    >
      {children}
    </DefaultAuthProvider>
  );
}
