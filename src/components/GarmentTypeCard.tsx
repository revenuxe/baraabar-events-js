"use client";

import { Check, Minus, Plus } from "lucide-react";

export function GarmentTypeCard({
  label,
  image,
  selected,
  quantity,
  onToggle,
  onQtyChange,
}: {
  label: string;
  image: string;
  selected: boolean;
  quantity: number;
  onToggle: () => void;
  onQtyChange: (qty: number) => void;
}) {
  return (
    <div className="relative pt-10">
      {/* Card plate — sits behind the image, holds the label + qty controls. The
          whole plate is clickable so selection isn't limited to the label text. */}
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-3xl border bg-card pb-3 pt-24 text-center shadow-card transition active:scale-[0.98] ${
          selected ? "border-accent ring-2 ring-accent/40" : "border-border"
        }`}
      >
        <span className="font-display text-sm font-bold text-accent">{label}</span>

        {selected && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-3 rounded-full bg-muted px-1.5 py-1"
          >
            <button
              onClick={() => onQtyChange(quantity - 1)}
              className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground"
              aria-label={`Decrease ${label} quantity`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-4 text-center text-xs font-bold">{quantity}</span>
            <button
              onClick={() => onQtyChange(quantity + 1)}
              className="grid h-6 w-6 place-items-center rounded-full bg-card text-foreground"
              aria-label={`Increase ${label} quantity`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Image — taller than the card's reserved space, so it overflows above it */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <button
          onClick={onToggle}
          className="block h-32 w-24 overflow-hidden rounded-2xl shadow-card transition active:scale-[0.98]"
        >
          {/* Admins can paste any external image URL for a garment (see
              ImageUploadField), so next/image's remotePatterns allowlist
              can't cover it — plain <img> loads any domain. */}
          <img src={image} alt={label} loading="lazy" className="h-full w-full object-cover" />
        </button>
        {selected && (
          <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground shadow ring-2 ring-background">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
