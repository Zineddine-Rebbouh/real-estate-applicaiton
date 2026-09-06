import {
  BedDoubleIcon,
  BathIcon,
  Maximize2Icon,
  DollarSignIcon,
  CalendarIcon,
} from "lucide-react";
import { formatPriceValue } from "@/lib/utils";

interface KeyFactsStripProps {
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  deposit?: number;
  availableDate: string;
}

export function KeyFactsStrip({
  price,
  beds,
  baths,
  sqft,
  deposit,
  availableDate,
}: KeyFactsStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Stat 1: Monthly Rent (Visually Dominant) */}
      <div className="col-span-1 rounded-xl border-2 border-primary/30 bg-primary/[0.03] dark:bg-primary/[0.08] p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/50">
        <div className="flex items-center justify-between text-xs text-primary font-semibold uppercase tracking-wider">
          <span>Monthly Rent</span>
          <DollarSignIcon className="size-4 text-primary" />
        </div>
        <div className="my-1.5 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {formatPriceValue(price)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">/ month</span>
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Deposit: ${deposit ? deposit.toLocaleString() : price.toLocaleString()}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {availableDate === "Immediate" ? "Ready now" : availableDate}
          </span>
        </div>
      </div>

      {/* Stat 2: Bedrooms */}
      <div className="col-span-1 rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span>Bedrooms</span>
          <BedDoubleIcon className="size-4 text-muted-foreground" />
        </div>
        <div className="my-1.5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {beds === 0 ? "Studio" : `${beds} Bedroom${beds > 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          <span>{beds === 0 ? "Open layout living" : "Private sleeping rooms"}</span>
        </div>
      </div>

      {/* Stat 3: Bathrooms */}
      <div className="col-span-1 rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span>Bathrooms</span>
          <BathIcon className="size-4 text-muted-foreground" />
        </div>
        <div className="my-1.5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {baths} {baths === 1 ? "Full Bath" : "Bathrooms"}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          <span>Walk-in rain shower & tub</span>
        </div>
      </div>

      {/* Stat 4: Square Feet */}
      <div className="col-span-1 rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
          <span>Living Area</span>
          <Maximize2Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="my-1.5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {sqft.toLocaleString()}{" "}
            <span className="text-base font-medium text-muted-foreground">ft²</span>
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          <span>~{Math.round(sqft * 0.0929)} m² usable interior</span>
        </div>
      </div>
    </div>
  );
}

