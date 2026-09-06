"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";

import { Navbar } from "@/components/landing/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/tenant-dashboard/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useGetMeQuery } from "@/state/api";
import { Button } from "@/components/ui/button";

export default function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useGetMeQuery();
  const router = useRouter();
  const user = data?.user;

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading Manager Portal…</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== "MANAGER") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <ShieldAlertIcon className="size-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You are currently signed in with a Tenant account. The Manager Dashboard is only accessible to verified Property Managers.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => router.push("/tenant/overview")}>Go to Tenant Dashboard</Button>
          <Button variant="outline" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Navbar isDashboard />
      <AppSidebar userType="manager" />
      <SidebarInset className="dashboard-shell min-h-[calc(100svh-72px)] bg-muted/30 pt-[72px]">
        {children}
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}

