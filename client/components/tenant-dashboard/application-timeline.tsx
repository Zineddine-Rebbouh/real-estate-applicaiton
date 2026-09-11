"use client";

import React from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  FileCheckIcon,
  FileTextIcon,
  XCircleIcon,
  SparklesIcon,
  DownloadIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadLeaseAgreement } from "@/lib/utils";
import { toast } from "sonner";

export interface ApplicationTimelineProps {
  status: "Pending" | "Approved" | "Denied" | "Withdrawn";
  appliedDate: string;
  leaseId?: string | null;
  startDate?: string;
  endDate?: string;
  propertyName: string;
  compact?: boolean;
}

export function ApplicationTimeline({
  status,
  appliedDate,
  leaseId,
  startDate,
  endDate,
  propertyName,
  compact = false,
}: ApplicationTimelineProps) {
  const isApproved = status === "Approved";
  const isPending = status === "Pending";
  const isDenied = status === "Denied";
  const isWithdrawn = status === "Withdrawn";
  const hasLease = isApproved && Boolean(leaseId || startDate);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!leaseId) {
      toast.info("Lease agreement is being finalized by property management.");
      return;
    }
    const filename = `Lease_Agreement_${propertyName.replace(/\s+/g, "_")}.pdf`;
    try {
      await downloadLeaseAgreement(leaseId, filename);
      toast.success("Lease agreement downloaded", {
        description: filename,
      });
    } catch {
      toast.error("Couldn't download lease agreement. Please try again.");
    }
  };

  const steps = [
    {
      id: "applied",
      label: "Applied",
      subtext: appliedDate || "Submitted",
      state: "complete" as const,
      icon: CheckCircle2Icon,
    },
    {
      id: "review",
      label: "Under Review",
      subtext: isPending ? "Manager screening" : isApproved || isDenied ? "Review complete" : "Closed",
      state: isPending
        ? ("active" as const)
        : isApproved || isDenied
        ? ("complete" as const)
        : ("inactive" as const),
      icon: isPending ? ClockIcon : CheckCircle2Icon,
    },
    {
      id: "approved",
      label: isDenied ? "Denied" : isWithdrawn ? "Withdrawn" : "Approved",
      subtext: isApproved ? "Application accepted" : isDenied ? "Application closed" : isWithdrawn ? "Tenant withdrawn" : "Awaiting decision",
      state: isApproved
        ? ("complete" as const)
        : isDenied
        ? ("error" as const)
        : isWithdrawn
        ? ("inactive" as const)
        : ("upcoming" as const),
      icon: isApproved ? CheckCircle2Icon : isDenied ? XCircleIcon : ClockIcon,
    },
    {
      id: "leased",
      label: "Lease Minted",
      subtext: hasLease
        ? startDate
          ? `${startDate}`
          : "Contract generated"
        : "Pending approval",
      state: hasLease
        ? ("complete" as const)
        : ("upcoming" as const),
      icon: hasLease ? FileCheckIcon : FileTextIcon,
    },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider">Progress</span>
          <span className={isApproved ? "text-emerald-600 font-bold" : isPending ? "text-amber-600 font-bold" : "text-muted-foreground"}>
            {hasLease ? "Lease Minted" : isApproved ? "Approved" : isPending ? "Under Review" : status}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {steps.map((s, idx) => {
            const isDone = s.state === "complete";
            const isActive = s.state === "active";
            const isErr = s.state === "error";

            return (
              <div key={s.id} className="space-y-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-all ${
                    isDone
                      ? "bg-emerald-500"
                      : isActive
                      ? "bg-amber-500 animate-pulse"
                      : isErr
                      ? "bg-rose-500"
                      : "bg-muted"
                  }`}
                />
                <p className="text-[10px] text-muted-foreground truncate">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-xs">
      {/* Stepper Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Application Journey
          </span>
          {hasLease && (
            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[11px] font-semibold py-0.5">
              <SparklesIcon className="size-3 text-emerald-600" />
              <span>Lease Contract Minted</span>
            </Badge>
          )}
        </div>

        {hasLease && leaseId && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-8 gap-1.5 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <DownloadIcon className="size-3.5" />
            <span>Download Signed Lease (PDF)</span>
          </Button>
        )}
      </div>

      {/* Responsive Stepper Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
        {steps.map((step, idx) => {
          const isDone = step.state === "complete";
          const isActive = step.state === "active";
          const isErr = step.state === "error";
          const isUpcoming = step.state === "upcoming" || step.state === "inactive";
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex flex-col items-center text-center space-y-1.5">
              {/* Connector line on desktop */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-3.5 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 z-0 transition-colors ${
                    isDone && steps[idx + 1].state !== "upcoming" && steps[idx + 1].state !== "inactive"
                      ? "bg-emerald-500"
                      : "bg-border/60"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-2xs shrink-0 ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse"
                    : isErr
                    ? "bg-rose-500 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                <Icon className="size-3.5" />
              </div>

              <p
                className={`text-xs font-semibold truncate max-w-full ${
                  isDone
                    ? "text-foreground"
                    : isActive
                    ? "text-amber-600 font-bold"
                    : isErr
                    ? "text-rose-600"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>

              <p className="text-[11px] text-muted-foreground truncate max-w-full">
                {step.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

