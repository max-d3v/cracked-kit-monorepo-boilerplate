"use client";

import { getOrganizationSlug } from "@workspace/auth/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { ArrowLeft, Briefcase, Shield, User, Users } from "lucide-react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";

const navMain = [
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "account/profile",
        icon: User,
      },
      {
        title: "Security",
        url: "account/security",
        icon: Shield,
      },
      {
        title: "My Organizations",
        url: "account/organizations",
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        title: "Profile",
        url: "organization/profile",
        icon: Briefcase,
      },
      {
        title: "People",
        url: "organization/people",
        icon: Users,
      },
    ],
  },
];

export function SettingsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const organizationSlug = getOrganizationSlug();
  const settingsBase = `/${organizationSlug}/settings`;
  const items = navMain.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      url: `${settingsBase}/${item.url}`,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to app">
              <Link href={`/${organizationSlug}/dashboard`}>
                <ArrowLeft />
                <span>Back to app</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
