"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckIcon,
  ClipboardListIcon,
  ClockIcon,
  DownloadIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  XIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type ApplicationStatus = "Pending" | "Approved" | "Rejected";
type FilterStatus = "All" | ApplicationStatus;

type Application = {
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
};

const applications: Application[] = [
  {
    address: "42 North Street, Unit 3B",
    appliedOn: "September 3, 2026",
    manager: {
      email: "maya@lindenproperty.com",
      name: "Maya Chen",
      phone: "+1 (212) 555-0148",
      photo: "/landing-i1.png",
    },
    price: "$2,450/night",
    image: "/singlelisting-3.jpg",
    property: "North Street Lofts",
    status: "Pending",
  },
  {
    address: "18 Willow Lane, Apt 204",
    appliedOn: "August 28, 2026",
    endDate: "August 28, 2027",
    manager: {
      email: "jonas@willowhomes.com",
      name: "Jonas Reed",
      phone: "+1 (212) 555-0192",
      photo: "/landing-i2.png",
    },
    price: "$2,180/night",
    image: "/singlelisting-2.jpg",
    property: "Willow Lane Residences",
    status: "Approved",
    startDate: "September 15, 2026",
  },
  {
    address: "9 Park View Road, Apt 6C",
    appliedOn: "August 21, 2026",
    manager: {
      email: "elena@parkviewliving.com",
      name: "Elena Torres",
      phone: "+1 (212) 555-0177",
      photo: "/landing-i5.png",
    },
    price: "$1,950/night",
    image: "/landing-i3.png",
    property: "Park View House",
    status: "Pending",
  },
  {
    address: "7 Garden Square, Apt 12",
    appliedOn: "August 14, 2026",
    manager: {
      email: "samir@gardensquare.com",
      name: "Samir Patel",
      phone: "+1 (212) 555-0126",
      photo: "/landing-i6.png",
    },
    price: "$1,820/night",
    image: "/landing-i4.png",
    property: "Garden Square",
    status: "Rejected",
  },
  {
    address: "24 Linden Avenue, Apt 4A",
    appliedOn: "August 4, 2026",
    endDate: "August 4, 2027",
    manager: {
      email: "maya@lindenproperty.com",
      name: "Maya Chen",
      phone: "+1 (212) 555-0148",
      photo: "/landing-i1.png",
    },
    price: "$2,300/night",
    image: "/landing-splash.jpg",
    property: "The Linden House",
    status: "Approved",
    startDate: "August 18, 2026",
  },
];

const statusOptions: FilterStatus[] = ["All", "Pending", "Approved", "Rejected"];

const statusDetails = {
  Pending: { icon: ClockIcon, className: "bg-amber-500 text-white" },
  Approved: { icon: CheckIcon, className: "bg-emerald-500 text-white" },
  Rejected: { icon: XIcon, className: "bg-red-500 text-white" },
};

function ApplicationSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">
        <div className="flex flex-1 gap-4 p-5">
          <Skeleton className="aspect-4/3 w-32 shrink-0 rounded-lg" />
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

function EmptyState({ status }: { status: FilterStatus }) {
  if (status === "All") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ClipboardListIcon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-base font-medium">You haven&apos;t applied to any properties yet</h2>
        <Button className="mt-5" nativeButton={false} render={<Link href="/" />}>
          Browse Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      No {status.toLowerCase()} applications.
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const { icon: StatusIcon, className: statusClassName } = statusDetails[application.status];

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-border">
        <section className="flex min-w-0 flex-1 gap-4 p-5" aria-label="Property details">
          <Image
            src={application.image}
            alt={`${application.property} exterior`}
            width={136}
            height={102}
            className="aspect-4/3 w-32 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 self-center">
            <p className="text-base font-semibold">{application.property}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" /> {application.address}
            </p>
            <p className="mt-3 font-semibold">{application.price}</p>
          </div>
        </section>

        <section className="space-y-3 p-5 lg:w-60" aria-label="Application status">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className={`mt-1 ${statusClassName}`}>
              <StatusIcon /> {application.status}
            </Badge>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Applied Date</dt>
              <dd className="text-right font-medium">{application.appliedOn}</dd>
            </div>
            {application.status === "Approved" && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Start Date</dt>
                  <dd className="text-right font-medium">{application.startDate}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">End Date</dt>
                  <dd className="text-right font-medium">{application.endDate}</dd>
                </div>
              </>
            )}
          </dl>
        </section>

        <section className="flex items-start gap-3 p-5 lg:w-64" aria-label="Property manager contact">
          <Avatar>
            <AvatarImage src={application.manager.photo} alt="" />
            <AvatarFallback>{application.manager.name.split(" ").map((name) => name[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <p className="font-medium">{application.manager.name}</p>
            <a href={`tel:${application.manager.phone}`} className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground">
              <PhoneIcon className="size-3.5 shrink-0" /> {application.manager.phone}
            </a>
            <a href={`mailto:${application.manager.email}`} className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground">
              <MailIcon className="size-3.5 shrink-0" /> {application.manager.email}
            </a>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t p-4">
        <Button variant="outline" size="sm">
          View Property
        </Button>
        {application.status === "Approved" && (
          <Button variant="outline" size="sm">
            <DownloadIcon /> Download Agreement
          </Button>
        )}
        {application.status === "Pending" && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            Withdraw Application
          </Button>
        )}
        </div>
    </Card>
  );
}

export default function ApplicationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<FilterStatus>("All");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredApplications = applications.filter(
    (application) => activeStatus === "All" || application.status === activeStatus,
  );

  const countFor = (status: FilterStatus) =>
    status === "All"
      ? applications.length
      : applications.filter((application) => application.status === status).length;

  return (
    <main className="min-h-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Applications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track the progress of your rental applications in one place.
          </p>
        </header>

        <Tabs
          className="flex-col"
          value={activeStatus}
          onValueChange={(value) => setActiveStatus(value as FilterStatus)}
        >
          <TabsList className="w-full justify-start sm:w-fit">
            {statusOptions.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status} ({countFor(status)})
              </TabsTrigger>
            ))}
          </TabsList>
          {statusOptions.map((status) => (
            <TabsContent key={status} value={status} className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  <ApplicationSkeleton />
                  <ApplicationSkeleton />
                  <ApplicationSkeleton />
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <ApplicationCard key={`${application.property}-${application.appliedOn}`} application={application} />
                  ))}
                </div>
              ) : (
                <EmptyState status={status} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
