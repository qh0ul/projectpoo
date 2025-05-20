import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { APP_NAME } from "@/constants";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "A digital health record application.",
  // Add more metadata like icons, open graph, etc.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
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
        <Toaster />
      </body>
    </html>
  );
}
