"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FilterField = {
  label: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  unit?: string;
};

type PropertyFilterPanelProps = {
  fields: FilterField[];
  onSearch?: (values: Record<string, { from: string; to: string }>) => void;
  variant?: "hero" | "inline";
  className?: string;
};

export function PropertyFilterPanel({
  fields,
  onSearch,
  variant = "inline",
  className,
}: PropertyFilterPanelProps) {
  const [values, setValues] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const handleSearch = () => {
    onSearch?.(values);
  };

  const updateField = (label: string, type: "from" | "to", value: string) => {
    setValues((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        [type]: value,
      },
    }));
  };

  return (
    <div
      className={cn(
        variant === "hero"
          ? "rounded-xl bg-white/96 p-4 shadow-2xl shadow-black/20 ring-1 ring-white/40 sm:p-5"
          : "rounded-2xl bg-card p-6 shadow-lg ring-1 ring-foreground/10 lg:p-8",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
              {field.label}
              {field.unit ? ` (${field.unit})` : ""}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={field.fromPlaceholder}
                value={values[field.label]?.from || ""}
                onChange={(e) =>
                  updateField(field.label, "from", e.target.value)
                }
                className="h-10 bg-background text-sm"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder={field.toPlaceholder}
                value={values[field.label]?.to || ""}
                onChange={(e) => updateField(field.label, "to", e.target.value)}
                className="h-10 bg-background text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="mt-5 h-10 w-full gap-2 text-sm font-semibold sm:col-span-2 lg:col-span-1 lg:mt-0"
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  );
}
