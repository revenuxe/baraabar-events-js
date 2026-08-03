import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeasurementsView, type ProfileRow } from "./measurements-view";

export const metadata: Metadata = { title: "My measurements | Baraabar" };

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?redirect=%2Fprofile%2Fmeasurements");

  const { data } = await supabase
    .from("measurement_profiles")
    .select("id, name, unit, values, is_default, updated_at")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <MeasurementsView userId={user.id} initialRows={(data ?? []) as unknown as ProfileRow[]} />
  );
}
