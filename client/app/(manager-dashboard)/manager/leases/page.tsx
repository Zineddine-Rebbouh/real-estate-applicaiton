"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2Icon,
  CalendarIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  DollarSignIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetManagerPropertiesQuery } from "@/state/api";

export default function ManagerLeasesPage() {
  const { data, isLoading } = useGetManagerPropertiesQuery();
  const [searchQuery, setSearchQuery] = React.useState("");

  const properties = data?.properties ?? [];

  // Flatten active leases from manager properties or show occupied properties
  const propertiesWithLeases = properties.filter(
    (p) => p.activeLeasesCount && p.activeLeasesCount > 0
  );

  const filteredProperties = properties.filter((p) => {
    return (
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDownload = (propertyName: string) => {
    toast.success(`Downloading lease agreement for ${propertyName}...`, {
      description: "Standard residential lease PDF generated.",
    });
  };

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Lease Agreements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor active leases, tenant occupancy, and rent collection terms across your portfolio.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/manager/applications" className="flex items-center gap-1.5" />}
            size="sm"
          >
            <UserCheckIcon className="size-4" />
            <span>Review Applications</span>
          </Button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Lease metrics">
          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Listings</span>
              <Building2Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{properties.length}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Portfolio units</p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Occupancy Rate</span>
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {properties.length > 0
                ? `${Math.round((propertiesWithLeases.length / properties.length) * 100)}%`
                : "0%"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Units currently leased</p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Leases</span>
              <FileTextIcon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {properties.reduce((sum, p) => sum + (p.activeLeasesCount || 0), 0)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Executed agreements</p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Monthly Roll</span>
              <DollarSignIcon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              $
              {properties
                .reduce((sum, p) => sum + Number(p.pricePerMonth || 0), 0)
                .toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Contracted revenue</p>
          </Card>
        </section>

        {/* Search */}
        <div className="flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties or leases..."
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

        {/* Leases / Occupancy List */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const isOccupied = (property.activeLeasesCount ?? 0) > 0;

              return (
                <Card key={property.id} className="overflow-hidden p-0">
                  <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">
                    {/* Property info */}
                    <div className="flex min-w-0 flex-1 items-center gap-4 p-5">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <img
                          src={property.photoUrls?.[0] || "/singlelisting-1.jpg"}
                          alt={property.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground truncate">
                            {property.name}
                          </h2>
                          <Badge
                            variant={isOccupied ? "default" : "outline"}
                            className={
                              isOccupied
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px]"
                                : "text-muted-foreground text-[10px]"
                            }
                          >
                            {isOccupied ? "Leased" : "Vacant / Available"}
                          </Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPinIcon className="size-3 shrink-0" />
                          {property.address}, {property.city}, {property.state}
                        </p>
                        <p className="mt-2 text-sm font-bold text-foreground">
                          ${Number(property.pricePerMonth).toLocaleString()}
                          <span className="text-xs font-normal text-muted-foreground"> / mo</span>
                        </p>
                      </div>
                    </div>

                    {/* Status & terms */}
                    <div className="space-y-2 bg-muted/10 p-5 lg:w-72 text-xs">
                      <p className="font-semibold text-foreground">Lease Status</p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Active Agreements:</span>
                        <span className="font-medium text-foreground">
                          {property.activeLeasesCount ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Security Deposit:</span>
                        <span className="font-medium text-foreground">
                          ${Number(property.securityDeposit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Pending Applicants:</span>
                        <span className="font-medium text-foreground">
                          {property.pendingApplicationsCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-5 py-3">
                    <span className="text-xs text-muted-foreground">
                      Ref #{property.id.slice(0, 8).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/manager/properties/${property.id}`} />}
                        className="text-xs gap-1"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>Manage Listing</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(property.name)}
                        className="text-xs gap-1"
                      >
                        <DownloadIcon className="size-3.5" />
                        <span>Download Sample Lease</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-dashed">
            <CreditCardIcon className="size-10 text-muted-foreground/60" />
            <h3 className="mt-4 text-base font-semibold text-foreground">No leases or listings found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Create listings to start receiving applications and issuing lease agreements.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}

