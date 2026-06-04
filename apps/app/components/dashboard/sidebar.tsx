"use client";

import { getOrganizationSlug } from "@workspace/auth/lib/utils";
import { OrganizationSwitcher } from "@workspace/ui/components/auth/organization/organization-switcher";
import { UserButton } from "@workspace/ui/components/auth/user/user-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { BarChart3, LayoutDashboard, ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const organizationSlug = getOrganizationSlug();
  const dashboardBase = `/${organizationSlug}/dashboard`;

  const itemsWithOrganizationSlug = navItems.map((item) => ({
    ...item,
    url: `${dashboardBase}/${item.url}`,
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher
              className="w-full justify-between"
              setActive={(organization) => {
                router.push(
                  organization
                    ? `/${organization.slug}/dashboard`
                    : "/null/settings/account/organizations"
                );
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={itemsWithOrganizationSlug} />
      </SidebarContent>
      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
