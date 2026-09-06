"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface ListingAboutProps {
  paragraphs: string[];
  leaseTerm: string;
}

export function ListingAbout({ paragraphs, leaseTerm }: ListingAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          About this residence
        </h2>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {leaseTerm}
        </span>
      </div>

      <div className="relative">
        <div
          className={`space-y-3 text-sm sm:text-base leading-relaxed text-muted-foreground transition-[max-height] duration-250 ease-out overflow-hidden ${
            isExpanded ? "max-h-[1200px]" : "max-h-[110px]"
          }`}
        >
          {paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
      >
        <span>{isExpanded ? "Read less" : "Read more description"}</span>
        {isExpanded ? (
          <ChevronUpIcon className="size-4" />
        ) : (
          <ChevronDownIcon className="size-4" />
        )}
      </button>
    </div>
  );
}

