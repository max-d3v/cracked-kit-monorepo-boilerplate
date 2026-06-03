import { viewPaths } from "@better-auth-ui/core";
import { ensureSession } from "@better-auth-ui/react/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { auth } from "@workspace/auth/auth";
import { getQueryClient } from "@workspace/data-layer/hydration";

import { Settings } from "@workspace/ui/components/auth/settings/settings";
import { organizationPlugin } from "@workspace/ui/lib/auth/organization-plugin";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

const validSettingsPaths = [
  ...Object.values(viewPaths.settings),
  ...Object.values(organizationPlugin().viewPaths.settings),
];

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (!validSettingsPaths.includes(path)) {
    notFound();
  }

  const queryClient = getQueryClient();

  const session = await ensureSession(queryClient, auth, {
    headers: await headers(),
  });

  if (!session) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/settings/${path}`)}`
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Settings path={path} />
      </div>
    </HydrationBoundary>
  );
}
