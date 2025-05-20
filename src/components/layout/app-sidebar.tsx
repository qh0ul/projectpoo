"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME } from "@/constants";
import { Activity, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar as useSidebarContext } from "@/components/ui/sidebar"; // aliased import

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state: sidebarState } = useSidebarContext();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          {sidebarState === "expanded" && (
             <span className="font-semibold text-lg whitespace-nowrap">{APP_NAME}</span>
          )}
        </Link>
        {sidebarState === "expanded" && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                disabled={item.disabled}
                className={cn(item.disabled && "cursor-not-allowed opacity-50")}
              >
                <Link href={item.disabled ? "#" : item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Footer content if any, e.g. settings, logout */}
      </SidebarFooter>
    </Sidebar>
  );
}
