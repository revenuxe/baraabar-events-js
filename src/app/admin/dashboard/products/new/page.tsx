"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "../product-form";

type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };

export default function NewProductPage() {
  const searchParams = useSearchParams();
  const defaultCategoryId = searchParams.get("category") ?? undefined;
  const defaultSubcategoryId = searchParams.get("subcategory") ?? undefined;

  const [categories, setCategories] = useState<CategoryOption[] | null>(null);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: cats }, { data: subs }, { data: products }] = await Promise.all([
        supabase.from("categories").select("id,name").order("name"),
        supabase.from("subcategories").select("id,name,category_id").order("name"),
        supabase.from("products").select("tags"),
      ]);
      setCategories(cats ?? []);
      setSubcategories(subs ?? []);
      const tagSet = new Set<string>();
      for (const p of products ?? []) for (const t of p.tags) tagSet.add(t);
      setAllTags(Array.from(tagSet).sort());
    })();
  }, []);

  if (!categories) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;

  return (
    <ProductForm
      product={null}
      categories={categories}
      subcategories={subcategories}
      allTags={allTags}
      defaultCategoryId={defaultCategoryId}
      defaultSubcategoryId={defaultSubcategoryId}
    />
  );
}
