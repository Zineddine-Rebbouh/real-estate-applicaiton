"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  DownloadIcon,
  HouseIcon,
  MapPinIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadLeaseAgreement, openLeaseAgreement } from "@/lib/utils";
import {
  useCreateMaintenanceRequestMutation,
  useGetCurrentLeaseQuery,
  useGetTenantMaintenanceQuery,
  type Lease,
} from "@/state/api";

type Residence = {
  id: string;
  propertyId: string;
  address: string;
  endDate: string;
  image: string;
  property: string;
  rent: string;
  startDate: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatRent = (rent: number | string) =>
  `$${Number(rent).toLocaleString()} / month`;

function leaseToResidence(lease: Lease): Residence {
  return {
    id: lease.id,
    propertyId: lease.propertyId,
    address: lease.property?.address ?? "",
    endDate: formatDate(lease.endDate),
    image: lease.property?.photoUrls?.[0] ?? "/singlelisting-2.jpg",
    property: lease.property?.name ?? "Leased property",
    rent: formatRent(lease.rent),
    startDate: formatDate(lease.startDate),
  };
}

function LeaseDates({ residence }: { residence: Residence }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-start gap-2">
        <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Move-in</p>
          <p className="mt-1 font-medium">{residence.startDate}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Move-out</p>
          <p className="mt-1 font-medium">{residence.endDate}</p>
        </div>
      </div>
    </div>
  );
}

async function handleDownloadAgreement(residence: Residence) {
  const filename = `Lease_Agreement_${residence.property.replace(/\s+/g, "_")}.pdf`;
  try {
    await downloadLeaseAgreement(residence.id, filename);
    toast.success("Lease agreement downloaded", { description: filename });
  } catch {
    toast.error("Couldn't download the lease agreement");
  }
}

function LeaseActions({
  residence,
  compact = false,
}: {
  residence: Residence;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "border-t pt-4" : ""}`}>
      <Button variant="outline" size="sm" onClick={() => openLeaseAgreement(residence.id)}>View Lease</Button>
      <Button variant="outline" size="sm" onClick={() => handleDownloadAgreement(residence)}>
        <DownloadIcon /> Download Agreement
      </Button>
    </div>
  );
}

function CurrentResidenceCard({
  residence,
  onRequestMaintenance,
}: {
  residence: Residence;
  onRequestMaintenance: () => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid lg:grid-cols-[minmax(280px,0.85fr)_1.15fr]">
        <Image
          src={residence.image}
          alt={`${residence.property} exterior`}
          width={960}
          height={640}
          className="h-64 w-full object-cover lg:h-full lg:min-h-80"
        />
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Current Residence
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {residence.property}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5 shrink-0" /> {residence.address}
              </p>
            </div>
            <Badge className="bg-emerald-500 text-white">Active Lease</Badge>
          </div>

          <div className="grid gap-4 border-y py-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Monthly rent</p>
              <p className="mt-1 font-semibold">{residence.rent}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lease start</p>
              <p className="mt-1 font-medium">{residence.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lease end</p>
              <p className="mt-1 font-medium">{residence.endDate}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openLeaseAgreement(residence.id)}>View Lease</Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadAgreement(residence)}
            >
              <DownloadIcon /> Download Agreement
            </Button>
            <Button variant="outline" onClick={onRequestMaintenance}>
              <WrenchIcon /> Request Maintenance
            </Button>
            <Button variant="ghost">Contact Manager</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PastResidenceCard({ residence }: { residence: Residence }) {
  return (
    <Card className="overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-4/3">
        <Image
          src={residence.image}
          alt={`${residence.property} exterior`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">
          Past Lease
        </Badge>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{residence.property}</h3>
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" /> {residence.address}
            </p>
          </div>
          <p className="shrink-0 text-right font-semibold">{residence.rent}</p>
        </div>
        <LeaseDates residence={residence} />
        <LeaseActions residence={residence} compact />
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-muted"
        aria-hidden="true"
      >
        <HouseIcon className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-base font-medium">
        You don&apos;t have any residences yet
      </h2>
      <Button className="mt-5" nativeButton={false} render={<Link href="/tenant/explore" />}>
        Browse Properties
      </Button>
    </div>
  );
}

const maintenanceStatusStyles: Record<string, string> = {
  Open: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  InProgress: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  Resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

function MaintenanceSection({
  properties,
  defaultPropertyId,
}: {
  properties: { id: string; name: string }[];
  defaultPropertyId?: string;
}) {
  const { data, isLoading } = useGetTenantMaintenanceQuery();
  const [createRequest, { isLoading: isSubmitting }] =
    useCreateMaintenanceRequestMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(defaultPropertyId ?? "");

  const requests = data?.maintenanceRequests ?? [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = ((form.get("title") as string) || "").trim();
    const description = ((form.get("description") as string) || "").trim();
    if (!propertyId || !title || !description) return;
    try {
      await createRequest({ propertyId, title, description }).unwrap();
      setDialogOpen(false);
      toast.success("Maintenance request submitted");
    } catch {
      toast.error("Couldn't submit your request. Please try again.");
    }
  };

  return (
    <section
      id="maintenance-requests"
      className="space-y-4 scroll-mt-20"
      aria-labelledby="maintenance-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="maintenance-heading"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Maintenance Requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Report an issue and track how it&apos;s being handled.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setPropertyId(defaultPropertyId ?? properties[0]?.id ?? "");
            setDialogOpen(true);
          }}
          disabled={properties.length === 0}
        >
          <WrenchIcon className="size-4" />
          <span>Report an issue</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-foreground">No requests yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Anything broken? Report it and your manager will pick it up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.property.name} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {r.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 ${maintenanceStatusStyles[r.status] ?? ""}`}
                >
                  {r.status === "InProgress" ? "In Progress" : r.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report a maintenance issue</DialogTitle>
            <DialogDescription>
              Describe the problem and your property manager will follow up.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="mr-property" className="text-xs font-semibold">
                Property
              </Label>
              <select
                id="mr-property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                required
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mr-title" className="text-xs font-semibold">
                Issue
              </Label>
              <Input
                id="mr-title"
                name="title"
                placeholder="e.g. Kitchen faucet leaking"
                required
                maxLength={120}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mr-description" className="text-xs font-semibold">
                Details
              </Label>
              <textarea
                id="mr-description"
                name="description"
                rows={4}
                required
                maxLength={2000}
                placeholder="What&apos;s wrong, where, and since when?"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function ResidencePage() {
  const { data, isLoading, isError } = useGetCurrentLeaseQuery();

  const currentResidence = data?.currentLease
    ? leaseToResidence(data.currentLease)
    : null;
  const pastResidences = (data?.pastLeases ?? []).map(leaseToResidence);
  const hasResidences = currentResidence !== null || pastResidences.length > 0;
  const leaseProperties = [
    ...(currentResidence
      ? [{ id: currentResidence.propertyId, name: currentResidence.property }]
      : []),
    ...pastResidences.map((r) => ({ id: r.propertyId, name: r.property })),
  ];

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <header>
          {/* <p className="text-sm font-medium text-primary">Tenant dashboard</p> */}
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Residence
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your current home and previous lease history.
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="text-base font-medium">
              Couldn&apos;t load your residence
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        ) : !hasResidences ? (
          <EmptyState />
        ) : (
          <>
            {currentResidence && (
              <CurrentResidenceCard
                residence={currentResidence}
                onRequestMaintenance={() =>
                  document
                    .getElementById("maintenance-requests")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              />
            )}

            <section
              className="space-y-4"
              aria-labelledby="past-residences-heading"
            >
              <div>
                <h2
                  id="past-residences-heading"
                  className="font-display text-xl font-semibold tracking-tight"
                >
                  Past Residences
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your previous homes and lease agreements.
                </p>
              </div>
              {pastResidences.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pastResidences.map((residence) => (
                    <PastResidenceCard
                      key={residence.property}
                      residence={residence}
                    />
                  ))}
                </div>
              )}
            </section>

            <MaintenanceSection
              properties={leaseProperties}
              defaultPropertyId={currentResidence?.propertyId}
            />
          </>
        )}
      </div>
    </main>
  );
}
