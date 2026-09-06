import { CheckCircle2Icon } from "lucide-react";

interface ListingHighlightsProps {
  highlights: string[];
}

export function ListingHighlights({ highlights }: ListingHighlightsProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Quick Highlights
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Key decision points and architectural upgrades verified by our team
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <CheckCircle2Icon className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-foreground/90 font-medium leading-snug">
                {highlight}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

