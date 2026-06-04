import { Suspense } from "react";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { Dashboard } from "@/components/dashboard/dashboard-server";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardWelcome />
      <Suspense fallback={<DashboardLoading />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
