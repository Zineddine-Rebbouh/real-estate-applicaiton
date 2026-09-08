"use client";

import * as React from "react";
import {
  CalendarIcon,
  CheckCircle2Icon,
  InboxIcon,
  MailIcon,
  SearchIcon,
  VideoIcon,
  UsersIcon,
  XCircleIcon,
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
  useGetManagerContactMessagesQuery,
  useGetManagerTourRequestsQuery,
  useUpdateTourStatusMutation,
  type ManagerTourRequest,
} from "@/state/api";

const tourStatusDetails = {
  Pending: {
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  Confirmed: {
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  Declined: {
    className: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
};

export default function ManagerInquiriesPage() {
  const { data: toursData, isLoading: loadingTours } =
    useGetManagerTourRequestsQuery();
  const { data: messagesData, isLoading: loadingMessages } =
    useGetManagerContactMessagesQuery();
  const [updateTour, { isLoading: isUpdating }] = useUpdateTourStatusMutation();
  const [tab, setTab] = React.useState<"tours" | "messages">("tours");
  const [searchQuery, setSearchQuery] = React.useState("");

  const tours = toursData?.tourRequests ?? [];
  const messages = messagesData?.contactMessages ?? [];

  const handleTourStatus = async (
    id: string,
    status: ManagerTourRequest["status"],
  ) => {
    try {
      await updateTour({ id, status }).unwrap();
      toast.success(
        status === "Confirmed" ? "Tour confirmed" : "Tour declined",
      );
    } catch {
      toast.error("Failed to update the tour. Please try again.");
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredTours = tours.filter(
    (t) =>
      q === "" ||
      t.property.name.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q),
  );
  const filteredMessages = messages.filter(
    (m) =>
      q === "" ||
      m.property.name.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q),
  );

  return (
    <main className="min-h-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Inquiries
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tour requests and messages from prospective tenants.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inquiries..."
              className="h-9 pl-9 text-xs bg-card"
            />
          </div>
        </header>

        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as "tours" | "messages")}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full justify-start sm:w-auto bg-muted/60 p-1">
            <TabsTrigger value="tours" className="text-xs font-medium px-3 py-1.5">
              Tours ({tours.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs font-medium px-3 py-1.5">
              Messages ({messages.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "tours" ? (
          loadingTours ? (
            <div className="space-y-4">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          ) : filteredTours.length > 0 ? (
            <div className="space-y-4">
              {filteredTours.map((t) => (
                <Card key={t.id} className="overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
                    <PropertyThumb
                      src={t.property.photoUrls?.[0]}
                      alt={t.property.name}
                      className="size-16 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                          {t.tourType === "Video" ? (
                            <span className="inline-flex items-center gap-1.5">
                              <VideoIcon className="size-4" /> Video tour
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <UsersIcon className="size-4" /> In-person tour
                            </span>
                          )}
                        </h2>
                        <Badge
                          variant="outline"
                          className={`gap-1 text-[11px] ${tourStatusDetails[t.status].className}`}
                        >
                          {t.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.property.name} · {t.property.address},{" "}
                        {t.property.city}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                        <CalendarIcon className="size-3.5 text-muted-foreground" />
                        {t.preferredDate} at {t.preferredTime}
                      </p>
                      {t.note && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          &ldquo;{t.note}&rdquo;
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t.name} ({t.email})
                        {t.tenant.phoneNumber
                          ? ` · ${t.tenant.phoneNumber}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {t.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleTourStatus(t.id, "Confirmed")}
                            disabled={isUpdating}
                            className="text-xs gap-1"
                          >
                            <CheckCircle2Icon className="size-3.5" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTourStatus(t.id, "Declined")}
                            disabled={isUpdating}
                            className="text-xs text-destructive hover:bg-destructive/10"
                          >
                            <XCircleIcon className="size-3.5" />
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center rounded-2xl border-dashed p-12 text-center">
              <CalendarIcon className="size-10 text-muted-foreground/60" />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                No tour requests
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                New tour requests from listing pages will appear here.
              </p>
            </Card>
          )
        ) : loadingMessages ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((m) => (
              <Card key={m.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MailIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {m.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({m.email})
                        </span>
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Re: {m.property.name} · {m.property.address},{" "}
                      {m.property.city}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {m.message}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center rounded-2xl border-dashed p-12 text-center">
            <InboxIcon className="size-10 text-muted-foreground/60" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No messages
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Messages sent to you from listing pages will appear here.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
