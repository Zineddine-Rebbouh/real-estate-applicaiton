import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  CreditCardIcon,
  HouseIcon,
  MapPinIcon,
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

const applications = [
  {
    address: "18 Willow Lane, Apt 204",
    image: "/singlelisting-2.jpg",
    property: "Willow Lane Residences",
    status: "Approved",
    variant: "success",
  },
  {
    address: "42 North Street, Unit 3B",
    image: "/singlelisting-3.jpg",
    property: "North Street Lofts",
    status: "Pending",
    variant: "outline",
  },
  {
    address: "7 Garden Square, Apt 12",
    image: "/landing-i4.png",
    property: "Garden Square",
    status: "Rejected",
    variant: "destructive",
  },
] as const;

export default function OverviewPage() {
  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep track of your applications, payments, and current home.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Dashboard summary">
          <Card>
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">2</p>
                <p className="mt-1 text-xs text-muted-foreground">Across your saved homes</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <ClipboardListIcon className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Next Payment Due</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">€1,240</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDaysIcon className="size-3.5" /> October 1, 2026
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <CreditCardIcon className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Lease Status</p>
                <div className="mt-3">
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Through September 2027</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <HouseIcon className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight">Recent Applications</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your latest rental applications</p>
              </div>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/applications" />}>
                View all <ArrowRightIcon />
              </Button>
            </div>

            <div className="space-y-3">
              {applications.map((application) => (
                <Card key={application.property} size="sm" className="flex-row items-center gap-4 p-3">
                  <Image
                    src={application.image}
                    alt=""
                    width={80}
                    height={64}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{application.property}</p>
                    <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground">
                      <MapPinIcon className="size-3.5 shrink-0" /> {application.address}
                    </p>
                  </div>
                  <Badge variant={application.variant}>{application.status}</Badge>
                </Card>
              ))}
            </div>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Residence snapshot</CardTitle>
              <CardDescription>Your current home at a glance</CardDescription>
            </CardHeader>
            <Image
              src="/landing-splash.jpg"
              alt="Exterior of your current residence"
              width={960}
              height={540}
              className="h-48 w-full object-cover"
            />
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">The Linden House</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPinIcon className="size-3.5" /> 24 Linden Avenue, Apt 4A
                </p>
              </div>
              <Button className="w-full" nativeButton={false} render={<Link href="/residence" />}>
                View Residence <ArrowRightIcon />
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
