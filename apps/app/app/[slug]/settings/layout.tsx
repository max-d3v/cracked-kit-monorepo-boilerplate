import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SettingsSidebar } from "@/components/settings/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense
        fallback={<div>Loading sidebar... (This should not be visible)</div>}
      >
        <SettingsSidebar />
      </Suspense>
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
