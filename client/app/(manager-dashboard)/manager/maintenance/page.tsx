"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  SearchIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyThumb } from "@/components/rentals/property-thumb";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetManagerMaintenanceQuery,
  useUpdateMaintenanceStatusMutation,
  type ManagerMaintenanceRequest,
} from "@/state/api";

type FilterStatus = "All" | ManagerMaintenanceRequest["status"];

const statusDetails = {
  Open: {
    icon: ClockIcon,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  InProgress: {
    icon: WrenchIcon,
    className: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  },
  Resolved: {
    icon: CheckCircle2Icon,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
};

const statusLabel: Record<ManagerMaintenanceRequest["status"], string> = {
  Open: "Open",
  InProgress: "In Progress",
  Resolved: "Resolved",
};

export default function ManagerMaintenancePage() {
  const { data, isLoading } = useGetManagerMaintenanceQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateMaintenanceStatusMutation();
  const [activeStatus, setActiveStatus] = React.useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const requests = data?.maintenanceRequests ?? [];

  const countFor = (status: FilterStatus) =>
    status === "All"
      ? requests.length
      : requests.filter((r) => r.status === status).length;

  const filtered = requests.filter((r) => {
    const matchesStatus = activeStatus === "All" || r.status === activeStatus;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.property.name.toLowerCase().includes(q) ||
      (r.tenant.user?.name ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (
    id: string,
    status: ManagerMaintenanceRequest["status"],
  ) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Request marked as ${statusLabel[status].toLowerCase()}`);
    } catch {
      toast.error("Failed to update the request. Please try again.");
    }
  };

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Maintenance Requests
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Issues reported by tenants across your properties.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requests..."
              className="h-9 pl-9 text-xs bg-card"
            />
          </div>
        </header>

        <Tabs
          value={activeStatus}
          onValueChange={(val) => setActiveStatus(val as FilterStatus)}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full justify-start sm:w-auto bg-muted/60 p-1">
            {(["All", "Open", "InProgress", "Resolved"] as FilterStatus[]).map(
              (status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="text-xs font-medium px-3 py-1.5"
                >
                  {status === "InProgress" ? "In Progress" : status} (
                  {countFor(status)})
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((r) => {
              const { icon: StatusIcon, className } = statusDetails[r.status];
              return (
                <Card key={r.id} className="overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
                    <PropertyThumb
                      src={r.property.photoUrls?.[0]}
                      alt={r.property.name}
                      className="size-16 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                          {r.title}
                        </h2>
                        <Badge
                          variant="outline"
                          className={`gap-1 text-[11px] ${className}`}
                        >
                          <StatusIcon className="size-3" />
                          {statusLabel[r.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.property.name} · {r.property.address},{" "}
                        {r.property.city} · Reported{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {r.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tenant: {r.tenant.user?.name ?? "—"}
                        {r.tenant.user?.email
                          ? ` (${r.tenant.user.email})`
                          : ""}
                        {r.tenant.phoneNumber
                          ? ` · ${r.tenant.phoneNumber}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {r.status === "Open" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(r.id, "InProgress")}
                          disabled={isUpdating}
                          className="text-xs"
                        >
                          Start work
                        </Button>
                      )}
                      {r.status !== "Resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(r.id, "Resolved")}
                          disabled={isUpdating}
                          className="text-xs gap-1"
                        >
                          <CheckCircle2Icon className="size-3.5" />
                          Resolve
                        </Button>
                      )}
                      {r.status === "Resolved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(r.id, "Open")}
                          disabled={isUpdating}
                          className="text-xs text-muted-foreground"
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center rounded-2xl border-dashed p-12 text-center">
            <ClipboardListIcon className="size-10 text-muted-foreground/60" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No maintenance requests
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? `No requests matching "${searchQuery}".`
                : "New tenant reports will appear here."}
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
