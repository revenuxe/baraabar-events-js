"use client";

import { GarmentTypeCard } from "@/components/GarmentTypeCard";
import type { BookingDraft } from "@/lib/booking-store";
import { garmentImg, type CategoryRow, type GarmentTypeRow } from "../_lib/helpers";

export function StepDetails({
  draft,
  update,
  categories,
  garmentTypes,
}: {
  draft: BookingDraft;
  update: (p: Partial<BookingDraft>) => void;
  categories: CategoryRow[];
  garmentTypes: GarmentTypeRow[];
}) {
  const activeCategory = categories.find((c) => c.slug === draft.category);
  const availableGarments = activeCategory
    ? garmentTypes.filter((g) => g.category_id === activeCategory.id)
    : [];
  const catLabel = activeCategory?.name ?? "your outfit";

  const itemFor = (g: string) => draft.items.find((it) => it.garment === g);

  const toggleGarment = (g: string) => {
    if (itemFor(g)) {
      update({ items: draft.items.filter((it) => it.garment !== g) });
    } else {
      update({
        items: [
          ...draft.items,
          { garment: g, quantity: 1, references: [], measurementMode: "sample" },
        ],
      });
    }
  };

  const setQty = (g: string, qty: number) => {
    if (qty < 1) {
      update({ items: draft.items.filter((it) => it.garment !== g) });
      return;
    }
    update({
      items: draft.items.map((it) => (it.garment === g ? { ...it, quantity: qty } : it)),
    });
  };

  const totalPieces = draft.items.reduce((n, it) => n + it.quantity, 0);

  return (
    <div className="animate-rise-in space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">{catLabel}</p>
        <h2 className="mt-1 font-display text-2xl leading-tight">What are we making?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick as many garments as you like, and set a quantity for each.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {availableGarments.map((g) => {
          const item = itemFor(g.name);
          return (
            <GarmentTypeCard
              key={g.id}
              label={g.name}
              image={garmentImg(g, activeCategory)}
              selected={!!item}
              quantity={item?.quantity ?? 1}
              onToggle={() => toggleGarment(g.name)}
              onQtyChange={(qty) => setQty(g.name, qty)}
            />
          );
        })}
      </div>

      {draft.items.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {draft.items.length} garment type{draft.items.length > 1 ? "s" : ""} · {totalPieces} piece
          {totalPieces > 1 ? "s" : ""} total. Style and fabric come next.
        </p>
      )}
    </div>
  );
}
