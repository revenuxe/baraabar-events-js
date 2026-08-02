"use client";

import { FabricCard } from "@/components/FabricCard";
import type { BookingDraft } from "@/lib/booking-store";
import type { FabricTypeRow } from "../_lib/helpers";

export function StepFabric({
  draft,
  update,
  fabricTypes,
}: {
  draft: BookingDraft;
  update: (p: Partial<BookingDraft>) => void;
  fabricTypes: FabricTypeRow[];
}) {
  const toggle = (name: string) => {
    update({
      fabrics: draft.fabrics.includes(name)
        ? draft.fabrics.filter((f) => f !== name)
        : [...draft.fabrics, name],
    });
  };

  return (
    <div className="animate-rise-in space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Fabric</p>
        <h2 className="mt-1 font-display text-2xl leading-tight">What type of fabric you have?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick as many as apply — this just helps our tailors prepare. Not sure? Skip it.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {fabricTypes.map((f) => (
          <FabricCard
            key={f.id}
            label={f.name}
            description={f.description}
            image={f.image_url}
            selected={draft.fabrics.includes(f.name)}
            onSelect={() => toggle(f.name)}
          />
        ))}
      </div>
    </div>
  );
}
