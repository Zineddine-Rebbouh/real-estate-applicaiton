"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  DollarSignIcon,
  EyeIcon,
  FileTextIcon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetManagerApplicationsQuery,
  useGetManagerPropertiesQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";

const statusDetails = {
  Pending: {
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  Approved: {
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  Denied: {
    className: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
};

export default function ManagerOverviewPage() {
  const { data: propertiesData, isLoading: loadingProps } = useGetManagerPropertiesQuery();
  const { data: appsData, isLoading: loadingApps } = useGetManagerApplicationsQuery();
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateApplicationStatusMutation();

  const properties = propertiesData?.properties ?? [];
  const applications = appsData?.applications ?? [];

  const pendingApps = applications.filter((a) => a.status === "Pending");
  const approvedApps = applications.filter((a) => a.status === "Approved");

  const totalMonthlyRent = properties.reduce(
    (sum, p) => sum + Number(p.pricePerMonth || 0),
    0
  );

  const handleAction = async (id: string, status: "Approved" | "Denied") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(
        status === "Approved" ? "Application Approved" : "Application Denied",
        {
          description: `Applicant has been notified.`,
        }
      );
    } catch {
      toast.error("Failed to update application status");
    }
  };

  const isLoading = loadingProps || loadingApps;

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Manager Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Here is the operational summary of your portfolio and tenant inquiries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/manager/properties/new" className="flex items-center gap-1.5" />}
              size="sm"
            >
              <PlusIcon className="size-4" />
              <span>Add Property</span>
            </Button>
          </div>
        </header>

        {/* KPI Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Portfolio metrics">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Listings</span>
              <Building2Icon className="size-4 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-foreground">{properties.length}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Managed residential units</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pending Reviews</span>
              <ClockIcon className="size-4 text-amber-500" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-amber-600">{pendingApps.length}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Awaiting your approval</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Approved Leases</span>
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-emerald-600">{approvedApps.length}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Active lease commitments</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Est. Monthly Roll</span>
              <DollarSignIcon className="size-4 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-24" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-foreground">
                ${totalMonthlyRent.toLocaleString()}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Combined listing value</p>
          </Card>
        </section>

        {/* Section: Pending Inquiries Queue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Pending Applications Queue</h2>
              <p className="text-xs text-muted-foreground">
                Review and take immediate action on prospective tenant submissions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/manager/applications" />}
            >
              View All Queue
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : pendingApps.length > 0 ? (
            <div className="grid gap-3">
              {pendingApps.slice(0, 3).map((app) => (
                <Card key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm shrink-0">
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{app.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Applied for <span className="font-medium text-foreground">{app.property.name}</span> (${app.property.pricePerMonth}/mo)
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {app.email} • {app.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 border-emerald-300"
                      onClick={() => handleAction(app.id, "Approved")}
                      disabled={updatingStatus}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleAction(app.id, "Denied")}
                      disabled={updatingStatus}
                    >
                      Deny
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-card">
              <FileTextIcon className="size-8 mx-auto text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium text-foreground">No pending applications</p>
              <p className="text-xs text-muted-foreground mt-1">
                All inquiries have been reviewed. New submissions will appear here.
              </p>
            </Card>
          )}
        </section>

        {/* Section: Your Managed Listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Active Listings</h2>
              <p className="text-xs text-muted-foreground">Properties currently listed in your manager portfolio.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/manager/properties" />}
            >
              View All Properties
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 3).map((prop) => (
                <Card key={prop.id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-16/9 w-full bg-muted">
                      <img
                        src={prop.photoUrls?.[0] || "/singlelisting-1.jpg"}
                        alt={prop.name}
                        className="size-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-background/80 text-foreground backdrop-blur-xs">
                        {prop.propertyType}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-semibold text-sm text-foreground truncate">{prop.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <MapPinIcon className="size-3 shrink-0" />
                        {prop.address}, {prop.city}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-foreground">
                          ${Number(prop.pricePerMonth).toLocaleString()}{" "}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {prop.beds} Beds • {prop.baths} Baths
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t p-3 flex items-center justify-between bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                      {prop.pendingApplicationsCount ?? 0} Pending Apps
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      nativeButton={false}
                      render={<Link href={`/manager/properties/${prop.id}`} />}
                      className="gap-1 text-xs"
                    >
                      <EyeIcon className="size-3.5" />
                      <span>Manage</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <Building2Icon className="size-10 mx-auto text-muted-foreground/60" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">No listings published yet</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                Create your first property listing to start receiving tenant applications and managing leases.
              </p>
              <Button
                className="mt-4"
                size="sm"
                nativeButton={false}
                render={<Link href="/manager/properties/new" />}
              >
                <PlusIcon className="size-3.5 mr-1" />
                Add Your First Property
              </Button>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}

