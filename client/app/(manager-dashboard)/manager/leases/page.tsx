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
import { PropertyThumb } from "@/components/rentals/property-thumb";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateLeasePaymentMutation,
  useGetManagerPropertiesQuery,
} from "@/state/api";
import { downloadLeaseAgreement } from "@/lib/utils";

export default function ManagerLeasesPage() {
  const { data, isLoading } = useGetManagerPropertiesQuery();
  const [createPayment, { isLoading: isCreating }] =
    useCreateLeasePaymentMutation();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [invoiceFor, setInvoiceFor] = React.useState<{
    propertyId: string;
    leaseId: string;
    amountDue: string;
    amountPaid: string;
    dueDate: string;
    paymentStatus: "Pending" | "Paid" | "PartiallyPaid" | "Overdue";
  } | null>(null);

  const properties = data?.properties ?? [];

  // Flatten active leases from manager properties or show occupied properties
  const propertiesWithLeases = properties.filter(
    (p) => p.activeLeasesCount && p.activeLeasesCount > 0,
  );

  const filteredProperties = properties.filter((p) => {
    return (
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDownload = async (
    leaseId: string | undefined,
    propertyName: string,
  ) => {
    if (!leaseId) {
      toast.info(`No active lease for ${propertyName} yet.`);
      return;
    }
    try {
      await downloadLeaseAgreement(leaseId, `lease-${propertyName}.pdf`);
      toast.success(`Lease agreement for ${propertyName} downloaded.`);
    } catch {
      toast.error("Couldn't download the lease agreement. Please try again.");
    }
  };

  const openInvoice = (
    propertyId: string,
    leaseId: string,
    rent: number | string,
  ) =>
    setInvoiceFor({
      propertyId,
      leaseId,
      amountDue: String(rent ?? ""),
      amountPaid: "0",
      dueDate: new Date().toISOString().slice(0, 10),
      paymentStatus: "Pending",
    });

  const handleCreateInvoice = async () => {
    if (!invoiceFor) return;
    try {
      await createPayment({
        leaseId: invoiceFor.leaseId,
        amountDue: Number(invoiceFor.amountDue),
        amountPaid: Number(invoiceFor.amountPaid || 0),
        dueDate: invoiceFor.dueDate,
        paymentStatus: invoiceFor.paymentStatus,
      }).unwrap();
      toast.success("Invoice created for this lease.");
      setInvoiceFor(null);
    } catch {
      toast.error("Failed to create invoice. Please check the fields.");
    }
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
              Monitor active leases, tenant occupancy, and rent collection terms
              across your portfolio.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={
              <Link
                href="/manager/applications"
                className="flex items-center gap-1.5"
              />
            }
            size="sm"
          >
            <UserCheckIcon className="size-4" />
            <span>Review Applications</span>
          </Button>
        </header>

        {/* Stats */}
        <section
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          aria-label="Lease metrics"
        >
          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Monthly Roll
              </span>
              <DollarSignIcon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              $
              {properties
                .reduce((sum, p) => sum + Number(p.pricePerMonth || 0), 0)
                .toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Contracted revenue
            </p>
          </Card>
          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Listings
              </span>
              <Building2Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {properties.length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Portfolio units
            </p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Occupancy Rate
              </span>
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {properties.length > 0
                ? `${Math.round((propertiesWithLeases.length / properties.length) * 100)}%`
                : "0%"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Units currently leased
            </p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Active Leases
              </span>
              <FileTextIcon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {properties.reduce(
                (sum, p) => sum + (p.activeLeasesCount || 0),
                0,
              )}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Executed agreements
            </p>
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
                        <PropertyThumb
                          src={property.photoUrls?.[0]}
                          alt={property.name}
                          className="size-full"
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
                          <span className="text-xs font-normal text-muted-foreground">
                            {" "}
                            / mo
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status & terms */}
                    <div className="space-y-2 bg-muted/10 p-5 lg:w-72 text-xs">
                      <p className="font-semibold text-foreground">
                        Lease Status
                      </p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Active Agreements:</span>
                        <span className="font-medium text-foreground">
                          {property.activeLeasesCount ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Security Deposit:</span>
                        <span className="font-medium text-foreground">
                          $
                          {Number(
                            property.securityDeposit || 0,
                          ).toLocaleString()}
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
                        render={
                          <Link href={`/manager/properties/${property.id}`} />
                        }
                        className="text-xs gap-1"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>Manage Listing</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownload(
                            (property.leases ?? [])[0]?.id,
                            property.name,
                          )
                        }
                        className="text-xs gap-1"
                      >
                        <DownloadIcon className="size-3.5" />
                        <span>Download Lease</span>
                      </Button>
                      {(property.leases ?? []).length > 0 && (
                        <Button
                          size="sm"
                          onClick={() =>
                            openInvoice(
                              property.id,
                              (property.leases ?? [])[0].id,
                              (property.leases ?? [])[0].rent,
                            )
                          }
                          className="text-xs gap-1"
                        >
                          <PlusIcon className="size-3.5" />
                          <span>Add invoice</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-dashed">
            <CreditCardIcon className="size-10 text-muted-foreground/60" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No leases or listings found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Create listings to start receiving applications and issuing lease
              agreements.
            </p>
          </Card>
        )}
      </div>

      {/* Manual invoice dialog — no automated recurring billing in this pass */}
      <Dialog
        open={Boolean(invoiceFor)}
        onOpenChange={(open) => !open && setInvoiceFor(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add invoice</DialogTitle>
            <DialogDescription>
              Create a payment record against this lease. The tenant will see it
              in their billing history.
            </DialogDescription>
          </DialogHeader>
          {invoiceFor && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="invoice-due"
                    className="text-xs font-semibold"
                  >
                    Amount due *
                  </Label>
                  <Input
                    id="invoice-due"
                    type="number"
                    step="any"
                    min="0"
                    value={invoiceFor.amountDue}
                    onChange={(e) =>
                      setInvoiceFor((prev) =>
                        prev ? { ...prev, amountDue: e.target.value } : prev,
                      )
                    }
                    disabled={isCreating}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="invoice-paid"
                    className="text-xs font-semibold"
                  >
                    Amount paid
                  </Label>
                  <Input
                    id="invoice-paid"
                    type="number"
                    step="any"
                    min="0"
                    value={invoiceFor.amountPaid}
                    onChange={(e) =>
                      setInvoiceFor((prev) =>
                        prev ? { ...prev, amountPaid: e.target.value } : prev,
                      )
                    }
                    disabled={isCreating}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="invoice-date"
                    className="text-xs font-semibold"
                  >
                    Due date *
                  </Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={invoiceFor.dueDate}
                    onChange={(e) =>
                      setInvoiceFor((prev) =>
                        prev ? { ...prev, dueDate: e.target.value } : prev,
                      )
                    }
                    disabled={isCreating}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="invoice-status"
                    className="text-xs font-semibold"
                  >
                    Status
                  </Label>
                  <select
                    id="invoice-status"
                    value={invoiceFor.paymentStatus}
                    onChange={(e) =>
                      setInvoiceFor((prev) =>
                        prev
                          ? {
                              ...prev,
                              paymentStatus: e.target
                                .value as typeof prev.paymentStatus,
                            }
                          : prev,
                      )
                    }
                    disabled={isCreating}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="PartiallyPaid">Partially paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInvoiceFor(null)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateInvoice}
              disabled={isCreating}
            >
              {isCreating ? "Creating…" : "Create invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
