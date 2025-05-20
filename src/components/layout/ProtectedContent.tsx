
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/login']; // Add other public paths like /register if needed

export default function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login');
    }
    // If user is logged in and tries to access login page, redirect to dashboard
    if (!isLoading && user && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Chargement de l'application...</p>
      </div>
    );
  }

  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    // Still show loader while redirecting to prevent flash of content
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-4 text-lg text-muted-foreground">Redirection...</p>
      </div>
    );
  }
  
  // If it's a public path (like /login), render children directly without sidebar/header
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // If user is authenticated and it's not a public path, render with layout
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="flex flex-col flex-1 md:peer-data-[collapsible=icon]:pl-[var(--sidebar-width-icon)] peer-data-[collapsible=offcanvas]:pl-0 md:pl-[var(--sidebar-width)] transition-[padding-left] ease-linear duration-200">
        <AppHeader />
        <main className="flex-1">
          <SidebarInset>
            <div className="container max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </SidebarInset>
        </main>
      </div>
    </SidebarProvider>
  );
}
