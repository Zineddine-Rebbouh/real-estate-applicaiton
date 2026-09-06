"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  CheckIcon,
  ClipboardListIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SearchIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetManagerApplicationsQuery,
  useUpdateApplicationStatusMutation,
  type ManagerApplication,
} from "@/state/api";

type FilterStatus = "All" | "Pending" | "Approved" | "Denied";

const statusDetails = {
  Pending: {
    icon: ClockIcon,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  Approved: {
    icon: CheckIcon,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  Denied: {
    icon: XIcon,
    className: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
};

export default function ManagerApplicationsPage() {
  const { data, isLoading } = useGetManagerApplicationsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();

  const [activeStatus, setActiveStatus] = React.useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [confirmingAction, setConfirmingAction] = React.useState<{
    app: ManagerApplication;
    status: "Approved" | "Denied";
  } | null>(null);

  const applications = data?.applications ?? [];

  const countFor = (status: FilterStatus) =>
    status === "All"
      ? applications.length
      : applications.filter((a) => a.status === status).length;

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      activeStatus === "All" || app.status === activeStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.property.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmStatusChange = async () => {
    if (!confirmingAction) return;
    const { app, status } = confirmingAction;

    try {
      await updateStatus({ id: app.id, status }).unwrap();
      toast.success(
        status === "Approved"
          ? `Application for ${app.name} approved!`
          : `Application for ${app.name} denied.`,
        {
          description: `Listing: ${app.property.name}`,
        }
      );
      setConfirmingAction(null);
    } catch {
      toast.error("Failed to update application status. Please try again.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Application Review Queue
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review applicant details, evaluate qualifications, and approve or deny prospective leases.
            </p>
          </div>
        </header>

        {/* Top Summary Stat KPI Cards */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Application metrics">
          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Inquiries</span>
              <ClipboardListIcon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{applications.length}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">All properties</p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
              <ClockIcon className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">{countFor("Pending")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Requires your response</p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Approved Leases</span>
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{countFor("Approved")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Ready for agreement</p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Denied</span>
              <XCircleIcon className="size-4 text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600">{countFor("Denied")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Closed inquiries</p>
          </Card>
        </section>

        {/* Filter Controls & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={activeStatus}
            onValueChange={(val) => setActiveStatus(val as FilterStatus)}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full justify-start sm:w-auto bg-muted/60 p-1">
              {(["All", "Pending", "Approved", "Denied"] as FilterStatus[]).map((status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="text-xs font-medium px-3 py-1.5"
                >
                  {status} ({countFor(status)})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant or property..."
              className="h-9 pl-9 text-xs bg-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const { icon: StatusIcon, className: statusClassName } =
                statusDetails[app.status];

              return (
                <Card
                  key={app.id}
                  className="overflow-hidden p-0 transition-all hover:border-border/80 hover:shadow-2xs"
                >
                  <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">
                    {/* Section 1: Applicant Information */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-5 gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-base font-semibold text-foreground">
                            {app.name}
                          </h2>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MailIcon className="size-3" />
                              <a href={`mailto:${app.email}`} className="hover:underline">
                                {app.email}
                              </a>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <PhoneIcon className="size-3" />
                              <a href={`tel:${app.phoneNumber}`} className="hover:underline">
                                {app.phoneNumber}
                              </a>
                            </span>
                            <button
                              onClick={() => handleCopy(app.phoneNumber, "phone number")}
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy Phone"
                            >
                              <CopyIcon className="size-3" />
                            </button>
                          </div>
                        </div>

                        <Badge className={`gap-1 px-2.5 py-1 text-xs font-semibold shrink-0 ${statusClassName}`}>
                          <StatusIcon className="size-3.5" />
                          {app.status}
                        </Badge>
                      </div>

                      {app.message && (
                        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border">
                          <p className="font-semibold text-foreground/80 mb-0.5">Applicant Note:</p>
                          <p className="italic">"{app.message}"</p>
                        </div>
                      )}

                      <div className="text-[11px] text-muted-foreground">
                        Applied on: {new Date(app.applicationDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Section 2: Property Snapshot */}
                    <div className="flex items-center gap-4 p-5 lg:w-80 bg-muted/10">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={app.property.photoUrls?.[0] || "/singlelisting-1.jpg"}
                          alt={app.property.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {app.property.name}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                          <MapPinIcon className="size-3 shrink-0" />
                          {app.property.address}, {app.property.city}
                        </p>
                        <p className="text-xs font-bold text-foreground">
                          ${Number(app.property.pricePerMonth).toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-5 py-3">
                    <span className="text-xs text-muted-foreground">
                      Ref #{app.id.slice(0, 8).toUpperCase()}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/tenant/rentals/${app.property.id}`} />}
                        className="gap-1.5 text-xs"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>View Property</span>
                      </Button>

                      {app.status === "Pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                            onClick={() => setConfirmingAction({ app, status: "Approved" })}
                            disabled={isUpdating}
                          >
                            <CheckIcon className="size-3.5" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 text-xs"
                            onClick={() => setConfirmingAction({ app, status: "Denied" })}
                            disabled={isUpdating}
                          >
                            Deny
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setConfirmingAction({
                                app,
                                status: app.status === "Approved" ? "Denied" : "Approved",
                              })
                            }
                            disabled={isUpdating}
                          >
                            Change to {app.status === "Approved" ? "Denied" : "Approved"}
                          </Button>
                        </div>
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
            <h3 className="mt-4 text-base font-semibold text-foreground">No applications found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? `No applications matching "${searchQuery}".`
                : `You currently have no ${activeStatus !== "All" ? activeStatus.toLowerCase() : ""} applications.`}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmingAction)}
        onOpenChange={(open) => !open && setConfirmingAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmingAction?.status === "Approved" ? "Approve Application?" : "Deny Application?"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to mark the application from{" "}
              <strong className="text-foreground">{confirmingAction?.app.name}</strong> as{" "}
              <strong className={confirmingAction?.status === "Approved" ? "text-emerald-600" : "text-rose-600"}>
                {confirmingAction?.status}
              </strong>{" "}
              for {confirmingAction?.app.property.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingAction(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={confirmingAction?.status === "Approved" ? "default" : "destructive"}
              className={confirmingAction?.status === "Approved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              onClick={handleConfirmStatusChange}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating…" : `Confirm ${confirmingAction?.status}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

