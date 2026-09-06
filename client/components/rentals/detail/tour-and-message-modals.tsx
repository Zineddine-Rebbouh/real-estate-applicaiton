"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  UsersIcon,
  SendIcon,
  XIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { HostProfile } from "@/src/data/rental-details-data";

interface RequestTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  host: HostProfile;
}

export function RequestTourModal({
  isOpen,
  onClose,
  propertyTitle,
  host,
}: RequestTourModalProps) {
  const [tourType, setTourType] = useState<"in_person" | "video">("in_person");
  const [selectedDate, setSelectedDate] = useState("Tomorrow, Sep 6");
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [note, setNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success("Tour request sent successfully!", {
      description: `${host.name} from ${host.company} will confirm your ${tourType === "in_person" ? "in-person" : "virtual"} tour for ${selectedDate} at ${selectedTime}.`,
    });
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  const dates = [
    "Today, Sep 5",
    "Tomorrow, Sep 6",
    "Monday, Sep 8",
    "Tuesday, Sep 9",
  ];
  const timeSlots = ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM", "6:00 PM"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Request a Property Tour
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
              {propertyTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* In-person vs Virtual Toggle */}
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
              Tour Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTourType("in_person")}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  tourType === "in_person"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <UsersIcon className="size-4" />
                <span>In-Person Tour</span>
              </button>

              <button
                type="button"
                onClick={() => setTourType("video")}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  tourType === "video"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <VideoIcon className="size-4" />
                <span>Live Video Tour</span>
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
              Select Preferred Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-2 text-center text-xs font-medium transition-all ${
                    selectedDate === date
                      ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <CalendarIcon className="size-3.5 mb-0.5" />
                  <span>{date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
              Select Time Slot
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedTime === time
                      ? "border-primary bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ClockIcon className="size-3" />
                  <span>{time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests / Notes */}
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
              Notes or Questions (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Interested in move-in date around Oct 1, bringing a cat..."
              rows={2}
              className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Host info strip */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5 text-xs">
            <div className="relative size-8 rounded-full overflow-hidden shrink-0">
              <Image src={host.avatar} alt={host.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground truncate">{host.name}</div>
              <div className="text-[11px] text-muted-foreground">{host.viewingHours.weekdays}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] items-center px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitted}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2Icon className="size-4" />
                  <span>Confirmed!</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="size-4" />
                  <span>Confirm Tour Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ContactHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  host: HostProfile;
}

export function ContactHostModal({
  isOpen,
  onClose,
  propertyTitle,
  host,
}: ContactHostModalProps) {
  const [message, setMessage] = useState(
    "Hello Karolina, I am very interested in this property and would like more details about availability and application requirements."
  );
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    toast.success("Message sent to host", {
      description: `${host.name} typically responds ${host.responseTime.toLowerCase()}.`,
    });
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1000);
  };

  const quickQuestions = [
    "Is this apartment still available?",
    "Can I lease for 6 months instead of 12?",
    "Are all utilities included in the rent?",
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="relative size-11 rounded-full overflow-hidden bg-muted shrink-0">
              <Image src={host.avatar} alt={host.name} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-base font-bold text-foreground">{host.name}</h3>
                <ShieldCheckIcon className="size-4 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground">{host.role} · {host.company}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
              Quick Questions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(q)}
                  className="rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
              Your Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-background p-3 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Replies {host.responseTime.toLowerCase()}</span>
            <span>Languages: {host.languages.join(", ")}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] items-center px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <SendIcon className="size-4" />
              <span>{isSending ? "Sending..." : "Send Message"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

