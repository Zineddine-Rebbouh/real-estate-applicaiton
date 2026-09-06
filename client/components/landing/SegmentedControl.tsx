import React from 'react';

interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function SegmentedControl({ options, selected, onSelect }: SegmentedControlProps) {
  return (
    <div className="flex gap-2 rounded-full bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selected === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/10'}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

