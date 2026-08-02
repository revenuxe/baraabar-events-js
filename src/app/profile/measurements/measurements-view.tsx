"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Ruler, Star, Trash2, Check } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { GuidedMeasure } from "@/components/GuidedMeasure";
import {
  GARMENTS,
  GENERAL_MEASUREMENT_FIELDS,
  MEASUREMENT_FIELDS_BY_GARMENT,
  M_META,
  type MField,
} from "@/lib/measurements";
import { saveProfile, type MeasurementProfile } from "@/lib/booking-store";

export type ProfileRow = {
  id: string;
  name: string;
  unit: "cm" | "in";
  values: Record<string, number>;
  is_default: boolean;
  updated_at: string;
};

type View = "list" | "pick-garment" | "measuring";

export function MeasurementsView({
  userId,
  initialRows,
}: {
  userId: string;
  initialRows: ProfileRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [pendingFields, setPendingFields] = useState<MField[]>(GENERAL_MEASUREMENT_FIELDS);
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("measurement_profiles")
      .select("id, name, unit, values, is_default, updated_at")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });
    setRows((data as unknown as ProfileRow[]) ?? []);
  }

  function startNew() {
    setEditingId(null);
    setCustomName("");
    setPendingName("");
    setPendingFields(GENERAL_MEASUREMENT_FIELDS);
    setView("pick-garment");
  }

  function startEdit(row: ProfileRow) {
    setEditingId(row.id);
    setPendingName(row.name);
    setPendingFields(Object.keys(row.values) as MField[]);
    setView("measuring");
  }

  function pickGarment(g: string) {
    setPendingName(g);
    setPendingFields(MEASUREMENT_FIELDS_BY_GARMENT[g] ?? GENERAL_MEASUREMENT_FIELDS);
    setView("measuring");
  }

  function pickCustom() {
    if (!customName.trim()) return;
    setPendingName(customName.trim());
    setPendingFields(GENERAL_MEASUREMENT_FIELDS);
    setView("measuring");
  }

  async function handleFinish(profile: MeasurementProfile) {
    const supabase = createClient();
    if (editingId) {
      await supabase
        .from("measurement_profiles")
        .update({
          unit: profile.unit,
          values: profile.values,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);
    } else {
      const { data } = await supabase
        .from("measurement_profiles")
        .insert({
          user_id: userId,
          name: pendingName || "My measurements",
          unit: profile.unit,
          values: profile.values,
          is_default: rows.length === 0,
        })
        .select("id, is_default")
        .single();
      if (data?.is_default) saveProfile(profile);
    }
    await load();
    setView("list");
  }

  async function remove(id: string) {
    if (!confirm("Delete this measurement profile?")) return;
    const supabase = createClient();
    await supabase.from("measurement_profiles").delete().eq("id", id);
    await load();
  }

  async function setDefault(id: string) {
    const supabase = createClient();
    await supabase
      .from("measurement_profiles")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true);
    await supabase.from("measurement_profiles").update({ is_default: true }).eq("id", id);
    const row = rows.find((r) => r.id === id);
    if (row) saveProfile({ unit: row.unit, values: row.values, updatedAt: row.updated_at });
    await load();
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-5 pb-28 pt-2">
        {view === "list" ? (
          <>
            <Link
              href="/profile"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Profile
            </Link>
            <h1 className="mt-3 font-display text-3xl">My measurements</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save a profile per garment — Shirt, Lehenga, whatever you tailor most — and reuse it
              on every future order.
            </p>

            <div className="mt-5 space-y-2.5">
              {rows.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold">
                        {r.name}
                        {r.is_default && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            <Check className="h-2.5 w-2.5" /> Default
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {Object.keys(r.values).length} fields · updated{" "}
                        {new Date(r.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!r.is_default && (
                        <button
                          onClick={() => setDefault(r.id)}
                          aria-label="Set as default"
                          className="grid h-8 w-8 place-items-center rounded-full border border-border"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(r)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        aria-label="Delete profile"
                        className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-3 text-xs">
                    {Object.entries(r.values).map(([key, v]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {M_META[key as MField]?.label ?? key}
                        </span>
                        <span className="font-semibold">
                          {v} {r.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                    <Ruler className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold">No measurement profiles yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add one for each garment you tailor regularly.
                  </p>
                </div>
              )}

              <button
                onClick={startNew}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border py-3.5 text-sm font-bold text-muted-foreground"
              >
                <Plus className="h-4 w-4" /> Add measurement profile
              </button>
            </div>
          </>
        ) : view === "pick-garment" ? (
          <>
            <button
              onClick={() => setView("list")}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>
            <h1 className="mt-3 font-display text-3xl">What are we measuring for?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a garment so we ask for the right measurements.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {GARMENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => pickGarment(g)}
                  className="rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition active:scale-95"
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-bold">Or name it yourself</p>
              <div className="flex gap-2">
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Wedding fit"
                  className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={pickCustom}
                  disabled={!customName.trim()}
                  className="rounded-2xl bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="pt-2">
            <GuidedMeasure
              fields={pendingFields}
              initial={
                editingId
                  ? {
                      unit: rows.find((r) => r.id === editingId)?.unit ?? "cm",
                      values: rows.find((r) => r.id === editingId)?.values ?? {},
                      updatedAt: new Date().toISOString(),
                    }
                  : undefined
              }
              onCancel={() => setView(editingId ? "list" : "pick-garment")}
              onFinish={handleFinish}
            />
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
