"use client";

import { createClient } from "@/lib/supabase/client";
import { persistDraftForHandoff, type BookingDraft } from "@/lib/booking-store";

export type SavedDraft = {
  id: string;
  title: string;
  category_slug: string | null;
  garment_label: string | null;
  step: number;
  data: BookingDraft;
  updated_at: string;
};

export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

function draftTitle(d: BookingDraft) {
  const garments = d.items.map((i) => i.garment).join(", ");
  const parts = [garments, d.category].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Untitled design";
}

/** Save (or update) the in-progress booking to the signed-in user's account. */
export async function saveDraftToAccount(
  draft: BookingDraft,
  step: number,
  existingId?: string | null,
): Promise<string | null> {
  const supabase = createClient();
  const user = await getUser();
  if (!user) return null;

  const payload = {
    user_id: user.id,
    title: draftTitle(draft),
    category_slug: draft.category ?? null,
    garment_label: draft.items.map((i) => i.garment).join(", ") || null,
    step,
    data: draft as any,
  };

  if (existingId) {
    const { error } = await supabase
      .from("booking_drafts")
      .update(payload as any)
      .eq("id", existingId)
      .eq("user_id", user.id);
    if (error) throw error;
    return existingId;
  }

  const { data, error } = await supabase
    .from("booking_drafts")
    .insert(payload as any)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listDrafts(): Promise<SavedDraft[]> {
  const supabase = createClient();
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("booking_drafts")
    .select("id, title, category_slug, garment_label, step, data, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SavedDraft[];
}

export async function deleteDraft(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("booking_drafts").delete().eq("id", id);
  if (error) throw error;
}

/** Push a saved draft back into the local booking flow so /book resumes it,
 * at the step it was saved at — a one-shot handoff (see
 * persistDraftForHandoff), not an ongoing sync. */
export function resumeDraftLocally(d: SavedDraft) {
  persistDraftForHandoff(d.data, d.step ?? 0);
  try {
    localStorage.setItem("baraabar_active_draft_id", d.id);
  } catch {}
}

export function getActiveDraftId(): string | null {
  try {
    return localStorage.getItem("baraabar_active_draft_id");
  } catch {
    return null;
  }
}

export function setActiveDraftId(id: string | null) {
  try {
    if (id) localStorage.setItem("baraabar_active_draft_id", id);
    else localStorage.removeItem("baraabar_active_draft_id");
  } catch {}
}

/** Persist the pickup address to the account (kept as default address). */
export async function upsertDefaultAddress(userId: string, a: BookingDraft["address"]) {
  if (!a.line1 || !a.city || !a.pincode || !a.phone) return null;
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  const row = {
    user_id: userId,
    label: "Home",
    line1: a.line1,
    line2: a.line2 || null,
    city: a.city,
    pincode: a.pincode,
    phone: a.phone,
    is_default: true,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("addresses")
      .update(row as any)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await supabase
    .from("addresses")
    .insert(row as any)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Persist measurements so future orders reuse them. */
export async function upsertMeasurementProfile(
  userId: string,
  m: NonNullable<BookingDraft["measurements"]>,
) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("measurement_profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  const row = {
    user_id: userId,
    name: "My measurements",
    unit: m.unit,
    values: m.values as any,
    is_default: true,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("measurement_profiles")
      .update(row as any)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await supabase
    .from("measurement_profiles")
    .insert(row as any)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Ensure the profile row carries the latest name/phone. */
export async function syncProfileContact(userId: string, phone?: string, fullName?: string) {
  const supabase = createClient();
  const patch: Record<string, unknown> = {};
  if (phone) patch.phone = phone;
  if (fullName) patch.full_name = fullName;
  if (!Object.keys(patch).length) return;
  await supabase
    .from("profiles")
    .update(patch as any)
    .eq("id", userId);
}
