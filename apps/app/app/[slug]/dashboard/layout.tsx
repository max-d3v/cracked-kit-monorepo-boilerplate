import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense
        fallback={<div>Loading sidebar...(This should not be visible)</div>}
      >
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
