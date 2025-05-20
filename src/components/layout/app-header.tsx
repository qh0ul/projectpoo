
"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; // Button was not used, but can be kept for future use
import { APP_NAME } from "@/constants";
import { useState, useEffect } from "react";

export function AppHeader() {
  const { isMobile } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-screen-2xl">
        <div className="flex items-center gap-4">
          {isClient && isMobile && <SidebarTrigger title="Ouvrir/Fermer le menu latéral" />}
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">{APP_NAME}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

