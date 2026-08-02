"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CategoryOption = { id: string; name: string };
type GarmentOption = { id: string; name: string; category_id: string | null };

export function GarmentPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (garmentTypeId: string | null) => void;
}) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [garments, setGarments] = useState<GarmentOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: cats }, { data: gts }] = await Promise.all([
        supabase.from("categories").select("id,name").order("name"),
        supabase.from("garment_types").select("id,name,category_id").order("name"),
      ]);
      setCategories(cats ?? []);
      setGarments(gts ?? []);
    })();
  }, []);

  // Once the garment list loads, infer which category the current value belongs to.
  useEffect(() => {
    if (!value || selectedCategory) return;
    const match = garments.find((g) => g.id === value);
    if (match?.category_id) setSelectedCategory(match.category_id);
  }, [value, garments, selectedCategory]);

  const garmentOptions = selectedCategory
    ? garments.filter((g) => g.category_id === selectedCategory)
    : [];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <select
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(e.target.value);
          onChange(null);
        }}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">— select category —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={!selectedCategory}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="">— select garment —</option>
        {garmentOptions.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}
