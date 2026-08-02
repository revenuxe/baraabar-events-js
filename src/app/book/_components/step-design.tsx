"use client";

import { useRef, type MutableRefObject } from "react";
import { Check, Image as ImageIcon, Phone, Upload, X } from "lucide-react";
import type { BookingDraft, BookingItem } from "@/lib/booking-store";
import { STYLE_MAP } from "../_lib/helpers";

export function StepDesign({
  draft,
  update,
  pendingFilesRef,
}: {
  draft: BookingDraft;
  update: (p: Partial<BookingDraft>) => void;
  pendingFilesRef: MutableRefObject<Map<string, File>>;
}) {
  const setItemStyle = (garment: string, styleId: string | undefined) => {
    update({
      items: draft.items.map((it) => (it.garment === garment ? { ...it, styleId } : it)),
    });
  };

  const addRefs = (garment: string, files: FileList | null) => {
    if (!files) return;
    update({
      items: draft.items.map((it) => {
        if (it.garment !== garment) return it;
        const picked = Array.from(files).slice(0, 6 - it.references.length);
        const urls = picked.map((f) => {
          const url = URL.createObjectURL(f);
          pendingFilesRef.current.set(url, f);
          return url;
        });
        return { ...it, references: [...it.references, ...urls] };
      }),
    });
  };

  const removeRef = (garment: string, url: string) => {
    pendingFilesRef.current.delete(url);
    update({
      items: draft.items.map((it) =>
        it.garment === garment ? { ...it, references: it.references.filter((u) => u !== url) } : it,
      ),
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Your design</p>
        <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
          Show us what you want
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {draft.items.length > 1
            ? "Each garment gets its own references and style — upload, pick, or just ask us to call."
            : "Upload, pick, type, or just ask us to call — use any combination."}
        </p>
      </header>

      {draft.items.map((item) => (
        <GarmentDesignSection
          key={item.garment}
          item={item}
          onAddRefs={(files) => addRefs(item.garment, files)}
          onRemoveRef={(url) => removeRef(item.garment, url)}
          onSelectStyle={(styleId) => setItemStyle(item.garment, styleId)}
        />
      ))}

      {/* Notes */}
      <section>
        <p className="mb-2 text-sm font-bold">Tell us in your words</p>
        <textarea
          value={draft.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="e.g. mandarin collar, hidden buttons, ankle length, embroidery near cuffs…"
          rows={4}
          className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
        />
      </section>

      {/* Stylist call */}
      <section>
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <input
            type="checkbox"
            checked={draft.wantsStylistCall}
            onChange={(e) => update({ wantsStylistCall: e.target.checked })}
            className="mt-1 h-5 w-5 accent-[color:var(--brand-purple)]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent" />
              <p className="text-sm font-bold">Have a stylist call me</p>
              <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                Free
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              A 10-min call to finalise details — we'll ring you before pickup.
            </p>
          </div>
        </label>
      </section>
    </div>
  );
}

function GarmentDesignSection({
  item,
  onAddRefs,
  onRemoveRef,
  onSelectStyle,
}: {
  item: BookingItem;
  onAddRefs: (files: FileList | null) => void;
  onRemoveRef: (url: string) => void;
  onSelectStyle: (styleId: string | undefined) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const styles = STYLE_MAP[item.garment] ?? STYLE_MAP.Default;

  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card/50 p-4">
      <p className="font-display text-lg font-bold">
        {item.garment}
        {item.quantity > 1 && <span className="text-muted-foreground"> × {item.quantity}</span>}
      </p>

      {/* Upload */}
      <div>
        <p className="mb-2 text-sm font-bold">Reference images</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Screenshots from Pinterest, Instagram, or your own photos — up to 6.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {item.references.map((u) => (
            <div
              key={u}
              className="relative aspect-square overflow-hidden rounded-2xl border border-border"
            >
              <img src={u} alt="Reference" className="h-full w-full object-cover" />
              <button
                onClick={() => onRemoveRef(u)}
                aria-label="Remove"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {item.references.length < 6 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground"
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="h-5 w-5" />
                <span className="text-[11px] font-semibold">Add</span>
              </div>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            onAddRefs(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Style picker */}
      <div>
        <p className="mb-2 text-sm font-bold">Or start from a style</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {styles.map((s) => {
            const active = item.styleId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStyle(active ? undefined : s.id)}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition active:scale-95 ${
                  active
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-glow"
                    : "border-border bg-card"
                }`}
              >
                <ImageIcon className="mb-2 h-5 w-5 opacity-80" />
                <p className="text-sm font-bold">{s.label}</p>
                {active && <Check className="absolute right-2 top-2 h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
