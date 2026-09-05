"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClipboardListIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SearchIcon,
  SparklesIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export type ApplicationStatus = "Pending" | "Approved" | "Rejected";
export type FilterStatus = "All" | ApplicationStatus;

export type Application = {
  id: string;
  address: string;
  appliedOn: string;
  endDate?: string;
  image: string;
  manager: {
    email: string;
    name: string;
    phone: string;
    photo: string;
  };
  price: string;
  property: string;
  status: ApplicationStatus;
  startDate?: string;
  beds: string;
  baths: string;
  sqft: string;
};

const initialApplications: Application[] = [
  {
    id: "app-1",
    address: "42 North Street, Unit 3B",
    appliedOn: "September 3, 2026",
    manager: {
      email: "maya@lindenproperty.com",
      name: "Maya Chen",
      phone: "+1 (212) 555-0148",
      photo: "/landing-i1.png",
    },
    price: "$2,450 /mo",
    image: "/singlelisting-3.jpg",
    property: "North Street Lofts",
    status: "Pending",
    beds: "2 Beds",
    baths: "2 Baths",
    sqft: "1,120 sq ft",
  },
  {
    id: "app-2",
    address: "18 Willow Lane, Apt 204",
    appliedOn: "August 28, 2026",
    endDate: "August 28, 2027",
    manager: {
      email: "jonas@willowhomes.com",
      name: "Jonas Reed",
      phone: "+1 (212) 555-0192",
      photo: "/landing-i2.png",
    },
    price: "$2,180 /mo",
    image: "/singlelisting-2.jpg",
    property: "Willow Lane Residences",
    status: "Approved",
    startDate: "September 15, 2026",
    beds: "3 Beds",
    baths: "2 Baths",
    sqft: "1,450 sq ft",
  },
  {
    id: "app-3",
    address: "9 Park View Road, Apt 6C",
    appliedOn: "August 21, 2026",
    manager: {
      email: "elena@parkviewliving.com",
      name: "Elena Torres",
      phone: "+1 (212) 555-0177",
      photo: "/landing-i5.png",
    },
    price: "$1,950 /mo",
    image: "/landing-i3.png",
    property: "Park View House",
    status: "Pending",
    beds: "2 Beds",
    baths: "1 Bath",
    sqft: "980 sq ft",
  },
  {
    id: "app-4",
    address: "7 Garden Square, Apt 12",
    appliedOn: "August 14, 2026",
    manager: {
      email: "samir@gardensquare.com",
      name: "Samir Patel",
      phone: "+1 (212) 555-0126",
      photo: "/landing-i6.png",
    },
    price: "$1,820 /mo",
    image: "/landing-i4.png",
    property: "Garden Square",
    status: "Rejected",
    beds: "2 Beds",
    baths: "1 Bath",
    sqft: "940 sq ft",
  },
  {
    id: "app-5",
    address: "24 Linden Avenue, Apt 4A",
    appliedOn: "August 4, 2026",
    endDate: "August 4, 2027",
    manager: {
      email: "maya@lindenproperty.com",
      name: "Maya Chen",
      phone: "+1 (212) 555-0148",
      photo: "/landing-i1.png",
    },
    price: "$2,300 /mo",
    image: "/landing-splash.jpg",
    property: "The Linden House",
    status: "Approved",
    startDate: "August 18, 2026",
    beds: "3 Beds",
    baths: "2 Baths",
    sqft: "1,350 sq ft",
  },
];

const statusOptions: FilterStatus[] = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
];

const statusDetails = {
  Pending: {
    icon: ClockIcon,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  Approved: {
    icon: CheckIcon,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  Rejected: {
    icon: XIcon,
    className: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
};

function ApplicationSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">
        <div className="flex flex-1 gap-4 p-5">
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-56 max-w-full" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="space-y-3 p-5 lg:w-60">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-24 rounded-4xl" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex items-center gap-3 p-5 lg:w-64">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t p-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-36" />
      </div>
    </Card>
  );
}

export default function ApplicationsPage() {
  const [applicationsList, setApplicationsList] =
    useState<Application[]>(initialApplications);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [withdrawingApp, setWithdrawingApp] = useState<Application | null>(
    null,
  );
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 250);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const countFor = (status: FilterStatus) =>
    status === "All"
      ? applicationsList.length
      : applicationsList.filter((a) => a.status === status).length;

  const filteredApplications = applicationsList.filter((application) => {
    const matchesStatus =
      activeStatus === "All" || application.status === activeStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      application.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.manager.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmWithdraw = () => {
    if (!withdrawingApp) return;
    const target = withdrawingApp;
    setApplicationsList((prev) => prev.filter((app) => app.id !== target.id));
    setWithdrawingApp(null);

    toast.info(`Application for ${target.property} withdrawn`, {
      description: "You can re-apply anytime from public listings.",
      action: {
        label: "Undo",
        onClick: () => {
          setApplicationsList((prev) => [target, ...prev]);
          toast.success(`Application for ${target.property} restored`);
        },
      },
    });
  };

  const handleDownloadAgreement = (app: Application) => {
    const filename = `Lease_Agreement_${app.property.replace(/\s+/g, "_")}.pdf`;
    toast.success("Downloading Lease Agreement...", {
      description: `${filename} • Signed & Verified`,
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard: ${text}`);
  };

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor review milestones, lease approvals, and property manager
              communications.
            </p>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/" className="flex items-center gap-1.5" />}
            size="sm"
            className="w-fit"
          >
            <SparklesIcon className="size-3.5" />
            <span>Apply to New Rental</span>
          </Button>
        </header>

        {/* Top Summary Stat KPI Cards */}
        <section
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          aria-label="Application metrics"
        >
          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Submitted
              </span>
              <ClipboardListIcon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {applicationsList.length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              All time applications
            </p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Under Review
              </span>
              <ClockIcon className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {countFor("Pending")}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Manager review in progress
            </p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Approved Leases
              </span>
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {countFor("Approved")}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Agreements available to sign
            </p>
          </Card>

          <Card className="p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Rejected
              </span>
              <XCircleIcon className="size-4 text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {countFor("Rejected")}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Closed inquiries
            </p>
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
              {statusOptions.map((status) => (
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
              placeholder="Search applications..."
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
            <ApplicationSkeleton />
            <ApplicationSkeleton />
            <ApplicationSkeleton />
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const { icon: StatusIcon, className: statusClassName } =
                statusDetails[application.status];

              return (
                <Card
                  key={application.id}
                  className="overflow-hidden p-0 transition-all hover:border-border/80 hover:shadow-2xs"
                >
                  <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">
                    {/* Section 1: Property Snapshot */}
                    <section
                      className="flex min-w-0 flex-1 items-center gap-4 p-5"
                      aria-label="Property details"
                    >
                      <Image
                        src={application.image}
                        alt={`${application.property} exterior`}
                        width={80}
                        height={80}
                        className="size-20 shrink-0 rounded-xl object-cover shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground truncate">
                            {application.property}
                          </h2>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            {application.beds}
                          </Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          {application.address}
                        </p>
                        <p className="mt-2.5 text-sm font-bold text-foreground">
                          {application.price}
                        </p>
                      </div>
                    </section>

                    {/* Section 2: Application Milestones */}
                    <section
                      className="space-y-3 bg-muted/20 p-5 lg:w-64"
                      aria-label="Application status"
                    >
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Application Status
                        </span>
                        <div className="mt-1.5">
                          <Badge
                            className={`gap-1 px-2.5 py-1 text-xs font-semibold ${statusClassName}`}
                          >
                            <StatusIcon className="size-3.5" />
                            {application.status}
                          </Badge>
                        </div>
                      </div>

                      <dl className="space-y-1.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Submitted</dt>
                          <dd className="font-medium text-foreground">
                            {application.appliedOn}
                          </dd>
                        </div>
                        {application.status === "Approved" && (
                          <>
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">Move-in</dt>
                              <dd className="font-semibold text-emerald-600">
                                {application.startDate}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-muted-foreground">
                                Term End
                              </dt>
                              <dd className="font-medium text-foreground">
                                {application.endDate}
                              </dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </section>

                    {/* Section 3: Manager Contact */}
                    <section
                      className="flex items-center gap-3.5 p-5 lg:w-72"
                      aria-label="Property manager contact"
                    >
                      <Avatar className="size-11 border border-border">
                        <AvatarImage
                          src={application.manager.photo}
                          alt={application.manager.name}
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {application.manager.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {application.manager.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Property Manager
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <a
                            href={`tel:${application.manager.phone}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            title="Call Manager"
                          >
                            <PhoneIcon className="size-3" />
                            <span>Call</span>
                          </a>
                          <span className="text-border">•</span>
                          <a
                            href={`mailto:${application.manager.email}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            title="Email Manager"
                          >
                            <MailIcon className="size-3" />
                            <span>Email</span>
                          </a>
                          <span className="text-border">•</span>
                          <button
                            onClick={() =>
                              handleCopy(
                                application.manager.phone,
                                "phone number",
                              )
                            }
                            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Copy Phone"
                          >
                            <CopyIcon className="size-3" />
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-5 py-3">
                    <span className="text-xs text-muted-foreground">
                      Ref #{application.id.toUpperCase()} • All documents synced
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingApp(application)}
                        className="gap-1.5"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>View Property</span>
                      </Button>

                      {application.status === "Approved" && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadAgreement(application)}
                          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <DownloadIcon className="size-3.5" />
                          <span>Download Lease</span>
                        </Button>
                      )}

                      {application.status === "Pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWithdrawingApp(application)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ClipboardListIcon className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No applications found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? `No applications matching "${searchQuery}". Try clearing your query or adjusting the status filter.`
                : `You currently have no ${activeStatus.toLowerCase()} applications.`}
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
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Withdrawing Application */}
      <Dialog
        open={Boolean(withdrawingApp)}
        onOpenChange={(open) => !open && setWithdrawingApp(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 mb-2">
              <AlertCircleIcon className="size-5" />
            </div>
            <DialogTitle>Withdraw Rental Application?</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your application for{" "}
              <strong className="text-foreground">
                {withdrawingApp?.property}
              </strong>
              ? This action cancels manager review and frees up your application
              slot.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawingApp(null)}
            >
              Keep Application
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmWithdraw}
            >
              Withdraw Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Details Modal */}
      <Dialog
        open={Boolean(viewingApp)}
        onOpenChange={(open) => !open && setViewingApp(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {viewingApp && (
            <>
              <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={viewingApp.image}
                  alt={viewingApp.property}
                  fill
                  className="object-cover"
                />
                <Badge
                  className={`absolute top-3 left-3 ${statusDetails[viewingApp.status].className}`}
                >
                  {viewingApp.status}
                </Badge>
              </div>

              <DialogHeader className="pt-2">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg">
                    {viewingApp.property}
                  </DialogTitle>
                  <span className="text-lg font-bold text-foreground">
                    {viewingApp.price}
                  </span>
                </div>
                <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPinIcon className="size-3.5" /> {viewingApp.address}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Bedrooms
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {viewingApp.beds}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Bathrooms
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {viewingApp.baths}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Square Footage
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {viewingApp.sqft}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="size-10">
                  <AvatarImage
                    src={viewingApp.manager.photo}
                    alt={viewingApp.manager.name}
                  />
                  <AvatarFallback>
                    {viewingApp.manager.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">
                    {viewingApp.manager.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {viewingApp.manager.email}
                  </p>
                </div>
                <a
                  href={`tel:${viewingApp.manager.phone}`}
                  className="rounded-md border p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PhoneIcon className="size-4" />
                </a>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingApp(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  render={<Link href="/" />}
                  className="gap-1.5"
                >
                  <span>Browse Similar Units</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
