"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight } from "lucide-react";
import { deleteDraft, resumeDraftLocally, type SavedDraft } from "@/lib/account";

const STEP_LABELS = ["Outfit", "Design", "Measure", "Pickup", "Review"];

export function DraftsView({ initialRows }: { initialRows: SavedDraft[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);

  async function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      await deleteDraft(id);
    } catch {}
  }

  function resume(d: SavedDraft) {
    resumeDraftLocally(d);
    router.push("/book");
  }

  return (
    <div className="mt-5 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
      {rows.map((d) => (
        <article key={d.id} className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold capitalize">{d.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Saved {new Date(d.updated_at).toLocaleDateString()} · Step{" "}
                {Math.min(d.step + 1, STEP_LABELS.length)} of {STEP_LABELS.length} ·{" "}
                {STEP_LABELS[Math.min(d.step, STEP_LABELS.length - 1)]}
              </p>
            </div>
            <button
              onClick={() => remove(d.id)}
              aria-label="Delete draft"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-brand"
              style={{
                width: `${Math.round(((d.step + 1) / STEP_LABELS.length) * 100)}%`,
              }}
            />
          </div>

          <button
            onClick={() => resume(d)}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-5 py-3 text-xs font-bold text-primary-foreground shadow-glow"
          >
            Continue booking <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </article>
      ))}
    </div>
  );
}
