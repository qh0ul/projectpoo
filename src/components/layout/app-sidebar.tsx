
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
import { useSidebar as useSidebarContext } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state: sidebarState } = useSidebarContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          {isClient && sidebarState === "expanded" && (
             <span className="font-semibold text-lg whitespace-nowrap">{APP_NAME}</span>
          )}
           {!isClient && sidebarState === "expanded" && ( 
            <span className="font-semibold text-lg whitespace-nowrap invisible">{APP_NAME}</span>
          )}
        </Link>
        {isClient && sidebarState === "expanded" && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar} title="Ouvrir/Fermer le menu latéral">
            <PanelLeft />
            <span className="sr-only">Ouvrir/Fermer le menu latéral</span>
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
      </SidebarFooter>
    </Sidebar>
  );
}

