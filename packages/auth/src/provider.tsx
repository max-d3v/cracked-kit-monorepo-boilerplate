"use client";

import { AuthProvider as DefaultAuthProvider } from "@workspace/ui/components/auth/auth-provider";
import { organizationPlugin } from "@workspace/ui/lib/auth/organization-plugin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { authClient } from "./client";
import { getOrganizationSlug } from "./lib/utils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const slug = getOrganizationSlug();

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
      plugins={[
        organizationPlugin({
          slug,
          viewPaths: {
            organization: {
              settings: `../../${slug}/settings/organization/profile`,
              people: `../../${slug}/settings/organization/people`,
            },
          },
        }),
      ]}
      redirectTo={`/${slug}/dashboard`}
      socialProviders={["google"]}
      viewPaths={{
        settings: {
          account: `../${slug}/settings/account/profile`,
          organizations: `../${slug}/settings/account/organizations`,
          security: `../${slug}/settings/account/security`,
        },
      }}
    >
      {children}
    </DefaultAuthProvider>
  );
}
