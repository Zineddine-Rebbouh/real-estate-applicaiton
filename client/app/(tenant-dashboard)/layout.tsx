import * as React from "react";

import { Navbar } from "@/components/landing/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/tenant-dashboard/app-sidebar";

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Full-width navbar across the top of the viewport (fixed); the
          sidebar starts below it via top-[72px] in AppSidebar, and the
          content is offset with pt-[72px]. */}
      <Navbar isDashboard />
      <AppSidebar />
      <SidebarInset className="pt-[72px]">{children}</SidebarInset>
    </SidebarProvider>
  );
}
