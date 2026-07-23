"use client";

import Link from "next/link";
import { Building2 } from "@/components/icons";
import { useShallow } from "zustand/react/shallow";

import { Logo } from "@/components/logo";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarSupportCard } from "./sidebar-support-card";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );
  const currentUser = useCurrentUser();

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  const navUser = currentUser
    ? { name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar }
    : { name: "Agent", email: "", avatar: "" };

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard/overview" className="flex items-center justify-center">
                <span className="hidden group-data-[collapsible=icon]:inline text-xl font-bold leading-none text-sidebar-foreground">
                  R
                </span>
                <span className="group-data-[collapsible=icon]:hidden">
                  <Logo height={28} />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSupportCard />
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
