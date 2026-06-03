import { ensureSession } from "@better-auth-ui/react/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { auth } from "@workspace/auth/auth";
import { getQueryClient } from "@workspace/data-layer/hydration";

import { Organization } from "@workspace/ui/components/auth/organization/organization";
import { organizationPlugin } from "@workspace/ui/lib/auth/organization-plugin";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

const validOrganizationPaths = Object.values(
  organizationPlugin().viewPaths.organization
);

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (!validOrganizationPaths.includes(path)) {
    notFound();
  }

  const queryClient = getQueryClient();

  const session = await ensureSession(queryClient, auth, {
    headers: await headers(),
  });

  if (!session) {
    redirect(
      `/auth/sign-in?redirectTo=${encodeURIComponent(`/organization/${path}`)}`
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Organization path={path} />
      </div>
    </HydrationBoundary>
  );
}
