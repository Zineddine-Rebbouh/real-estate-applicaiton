"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CalendarIcon,
  MessageSquareIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeIcon,
  StarIcon,
  CheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { HostProfile } from "@/src/data/rental-details-data";
import { RequestTourModal, ContactHostModal } from "./tour-and-message-modals";
import { formatPriceValue } from "@/lib/utils";

interface ListingContactCardProps {
  propertyTitle: string;
  price: number;
  deposit: number;
  availableDate: string;
  host: HostProfile;
}

export function ListingContactCard({
  propertyTitle,
  price,
  deposit,
  availableDate,
  host,
}: ListingContactCardProps) {
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(host.phone);
      setCopiedPhone(true);
      toast.success("Phone number copied", {
        description: `${host.phone} copied to clipboard`,
      });
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      toast.info(`Host phone: ${host.phone}`);
    }
  };

  return (
    <>
      {/* DESKTOP STICKY CONTACT CARD */}
      <aside className="hidden lg:block sticky top-24 space-y-4">
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md transition-all">
          {/* Price Header */}
          <div className="pb-4 border-b border-border/70">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                  {formatPriceValue(price)}
                </span>
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  / month
                </span>
              </div>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {availableDate === "Immediate" ? "Available Now" : `From ${availableDate}`}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground flex justify-between">
              <span>Security Deposit</span>
              <span className="font-semibold text-foreground">
                ${deposit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Host / Agency Info */}
          <div className="py-4 border-b border-border/70 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative size-12 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                <Image
                  src={host.avatar}
                  alt={host.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                  <span className="truncate">{host.name}</span>
                  {host.verified && (
                    <span title="Verified Property Advisor" className="inline-flex">
                      <ShieldCheckIcon className="size-4 text-emerald-500 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{host.role}</p>
                <p className="text-[11px] font-medium text-primary truncate">
                  {host.company}
                </p>
              </div>
            </div>

            {/* Host Rating & Response Meta */}
            <div className="flex items-center justify-between text-xs bg-muted/40 rounded-lg p-2.5">
              <div className="flex items-center gap-1">
                <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{host.rating}</span>
                <span className="text-muted-foreground">({host.reviewCount})</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Replies {host.responseTime.toLowerCase()}
              </div>
            </div>

            {/* Phone contact */}
            <div className="flex items-center justify-between pt-1">
              <a
                href={`tel:${host.phone}`}
                className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors"
              >
                <PhoneIcon className="size-3.5 text-primary" />
                <span>{host.phone}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
              >
                {copiedPhone ? (
                  <>
                    <CheckIcon className="size-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
          </div>

          {/* Languages & Viewing Hours */}
          <div className="py-3.5 border-b border-border/70 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <GlobeIcon className="size-3.5 text-primary shrink-0" />
              <span>
                <strong className="text-foreground">Languages:</strong>{" "}
                {host.languages.join(", ")}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ClockIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div>
                  <strong className="text-foreground">Hours:</strong> {host.viewingHours.weekdays}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {host.viewingHours.weekends}
                </div>
              </div>
            </div>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="pt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => setIsTourModalOpen(true)}
              className="w-full flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CalendarIcon className="size-4.5" />
              <span>Request a Tour</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMessageModalOpen(true)}
              className="w-full flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MessageSquareIcon className="size-4" />
              <span>Message Advisor</span>
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Zero booking fees · 100% verified leaseholder guarantee
          </p>
        </div>
      </aside>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-2.5 shadow-2xl safe-area-inset-bottom">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-foreground leading-tight">
              {formatPriceValue(price)}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">/mo</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {availableDate === "Immediate" ? "Ready now" : availableDate}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMessageModalOpen(true)}
              aria-label="Message Host"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground hover:bg-muted"
            >
              <MessageSquareIcon className="size-4.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsTourModalOpen(true)}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-95"
            >
              <CalendarIcon className="size-4" />
              <span>Request Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tour Request Modal */}
      <RequestTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        propertyTitle={propertyTitle}
        host={host}
      />

      {/* Message Modal */}
      <ContactHostModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        propertyTitle={propertyTitle}
        host={host}
      />
    </>
  );
}
