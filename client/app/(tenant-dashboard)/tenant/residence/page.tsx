"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  DownloadIcon,
  HouseIcon,
  MapPinIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCurrentLeaseQuery, type Lease } from "@/state/api";

type Residence = {
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
    address: lease.property?.address ?? "",
    endDate: formatDate(lease.endDate),
    image: lease.property?.photoUrls?.[0] ?? "/singlelisting-1.jpg",
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

function LeaseActions({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "border-t pt-4" : ""}`}>
      <Button variant="outline" size="sm" onClick={() => toast.success("View Lease clicked")}>View Lease</Button>
      <Button variant="outline" size="sm" onClick={() => toast.success("Download Agreement clicked")}>
        <DownloadIcon /> Download Agreement
      </Button>
    </div>
  );
}

function CurrentResidenceCard({ residence }: { residence: Residence }) {
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
            <Button variant="outline">View Lease</Button>
            <Button variant="outline">
              <DownloadIcon /> Download Agreement
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
        <LeaseActions compact />
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
      <Button className="mt-5" nativeButton={false} render={<Link href="/" />}>
        Browse Properties
      </Button>
    </div>
  );
}

export default function ResidencePage() {
  const { data, isLoading, isError } = useGetCurrentLeaseQuery();

  const currentResidence = data?.currentLease
    ? leaseToResidence(data.currentLease)
    : null;
  const pastResidences = (data?.pastLeases ?? []).map(leaseToResidence);
  const hasResidences = currentResidence !== null || pastResidences.length > 0;

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
              <CurrentResidenceCard residence={currentResidence} />
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
          </>
        )}
      </div>
    </main>
  );
}
