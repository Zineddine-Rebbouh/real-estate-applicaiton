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
  const [values, setValues] = useState<Record<string, { from: string; to: string }>>({});

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
        "bg-card rounded-2xl shadow-lg p-6 lg:p-8 ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {field.label}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={field.fromPlaceholder}
                value={values[field.label]?.from || ""}
                onChange={(e) => updateField(field.label, "from", e.target.value)}
                className="h-9"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder={field.toPlaceholder}
                value={values[field.label]?.to || ""}
                onChange={(e) => updateField(field.label, "to", e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="mt-6 w-full sm:w-auto"
        onClick={handleSearch}
      >
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
}
