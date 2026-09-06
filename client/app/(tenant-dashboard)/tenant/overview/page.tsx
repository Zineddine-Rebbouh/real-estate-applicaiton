"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  CreditCardIcon,
  HeartIcon,
  HomeIcon,
  HouseIcon,
  MapPinIcon,
  SearchIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetMeQuery } from "@/state/api";
import { toast } from "sonner";

const applications = [
  {
    address: "18 Willow Lane, Apt 204",
    image: "/singlelisting-2.jpg",
    property: "Willow Lane Residences",
    status: "Approved",
    rent: "$2,180 /mo",
    variant: "success" as const,
    date: "Aug 28, 2026",
  },
  {
    address: "42 North Street, Unit 3B",
    image: "/singlelisting-3.jpg",
    property: "North Street Lofts",
    status: "Pending",
    rent: "$2,450 /mo",
    variant: "outline" as const,
    date: "Sep 3, 2026",
  },
  {
    address: "7 Garden Square, Apt 12",
    image: "/landing-i4.png",
    property: "Garden Square",
    status: "Rejected",
    rent: "$1,820 /mo",
    variant: "destructive" as const,
    date: "Aug 14, 2026",
  },
];

export default function OverviewPage() {
  const { data } = useGetMeQuery();
  const user = data?.user;
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(2026, 8, 5));

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentDone(true);
      toast.success("Rent payment of $1,240 confirmed!", {
        description: "Transaction ID #TX-984210. Receipt sent to your email.",
      });
      setTimeout(() => {
        setPayModalOpen(false);
        setPaymentDone(false);
      }, 1200);
    }, 900);
  };

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Personalized Header */}
        <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {user?.name ? user.name.split(" ")[0] : "Tenant"}
              </h1>
              <span className="hidden sm:inline-flex">
                <Badge
                  variant="outline"
                  className="gap-1 bg-background text-xs font-normal"
                >
                  <ShieldCheckIcon className="size-3.5 text-emerald-500" />
                  Verified Tenant
                </Badge>
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formattedDate} • Here is a snapshot of your home, lease, and
              applications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href="/tenant/explore" className="flex items-center gap-1.5" />
              }
            >
              <SearchIcon className="size-3.5" />
              <span>Explore Rentals</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setPayModalOpen(true)}
              className="bg-primary shadow-xs hover:bg-primary/90"
            >
              <CreditCardIcon className="size-3.5" />
              <span>Pay Rent</span>
            </Button>
          </div>
        </header>

        {/* Quick Actions Shortcuts */}
        <section aria-label="Quick Actions">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              onClick={() => setPayModalOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CreditCardIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  Pay Rent
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  $1,240 due Oct 1
                </p>
              </div>
            </button>

            <Link
              href="/tenant/residence"
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <WrenchIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  Maintenance
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Report an issue
                </p>
              </div>
            </Link>

            <Link
              href="/tenant/applications"
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <ClipboardListIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  Applications
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  2 active
                </p>
              </div>
            </Link>

            <Link
              href="/tenant/favorites"
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <HeartIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  Saved Homes
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  6 saved
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Dashboard Summary KPIs */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          aria-label="Dashboard summary"
        >
          <Card className="group transition-all hover:border-primary/40 hover:shadow-xs">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Active Applications
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    2
                  </p>
                  <span className="text-xs font-medium text-emerald-600">
                    1 Approved
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across 3 total submitted homes
                </p>
                <Link
                  href="/tenant/applications"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View status <ArrowRightIcon className="size-3" />
                </Link>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <ClipboardListIcon className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/40 hover:shadow-xs">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Next Payment Due
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    $1,240
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground"
                  >
                    Auto-pay on
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDaysIcon className="size-3.5" /> October 1, 2026
                </p>
                <button
                  onClick={() => setPayModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Pay now or view breakdown{" "}
                  <ArrowRightIcon className="size-3" />
                </button>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105">
                <CreditCardIcon className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/40 hover:shadow-xs">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Lease Status
                </p>
                <div className="mt-2">
                  <Badge variant="success" className="gap-1 font-medium">
                    <CheckCircle2Icon className="size-3" /> Active Lease
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-foreground font-medium truncate max-w-[180px]">
                  The Linden House, Apt 4A
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Through September 2027
                </p>
                <Link
                  href="/tenant/residence"
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Lease details <ArrowRightIcon className="size-3" />
                </Link>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-105">
                <HouseIcon className="size-5" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Content Grid: Recent Applications & Residence Snapshot */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          {/* Recent Applications */}
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Recent Applications
                </h2>
                <p className="text-xs text-muted-foreground">
                  Track latest updates on properties you applied for
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                render={
                  <Link
                    href="/tenant/applications"
                    className="flex items-center gap-1 text-xs"
                  />
                }
              >
                View all <ArrowRightIcon className="size-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {applications.map((application) => (
                <Card
                  key={application.property}
                  className="overflow-hidden transition-shadow hover:shadow-xs"
                >
                  <CardContent className="flex items-center justify-between gap-4 p-3.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Image
                        src={application.image}
                        alt={application.property}
                        width={80}
                        height={64}
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <Link
                          href="/tenant/applications"
                          className="truncate font-semibold text-sm hover:text-primary transition-colors block"
                        >
                          {application.property}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPinIcon className="size-3 shrink-0" />
                          {application.address}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {application.rent}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            • Applied {application.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant={application.variant}>
                        {application.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="xs"
                        render={<Link href="/tenant/applications" />}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Current Residence Snapshot Card */}
          <Card className="h-fit overflow-hidden">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Current Residence
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your active home at a glance
                  </CardDescription>
                </div>
                <Badge variant="success" className="text-xs">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
              <Image
                src="/landing-splash.jpg"
                alt="The Linden House exterior"
                width={960}
                height={540}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                Unit 4A • 2 Bed, 2 Bath
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="font-semibold text-foreground">
                  The Linden House
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPinIcon className="size-3.5" /> 24 Linden Avenue, Apt 4A
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Monthly Rent
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    $2,300 /mo
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">
                    Lease Term
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    Aug 2026 – Aug 2027
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  className="w-full"
                  size="sm"
                  render={
                    <Link
                      href="/tenant/residence"
                      className="flex items-center justify-center gap-1.5"
                    />
                  }
                >
                  <HomeIcon className="size-4" />
                  <span>View Residence Details</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link
                      href="/tenant/residence"
                      className="flex items-center justify-center gap-1.5"
                    />
                  }
                >
                  <WrenchIcon className="size-3.5" />
                  <span>Request Maintenance</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Interactive Rent Payment Modal */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Monthly Rent</DialogTitle>
            <DialogDescription>
              Submit your rent payment for The Linden House, Apt 4A.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Billing Period</span>
                <span className="font-medium text-foreground">
                  October 1 – 31, 2026
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2">
                <span className="text-sm font-medium text-foreground">
                  Total Amount Due
                </span>
                <span className="text-2xl font-bold text-foreground">
                  $1,240.00
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Payment Method
              </label>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <CreditCardIcon className="size-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">
                      Chase Checking Account
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Ending in •••• 4291
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Default
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPayModalOpen(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment || paymentDone}
              className="bg-primary text-primary-foreground"
            >
              {isProcessingPayment
                ? "Processing..."
                : paymentDone
                  ? "Paid!"
                  : "Confirm $1,240 Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
