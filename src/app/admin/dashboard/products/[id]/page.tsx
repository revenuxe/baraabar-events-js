"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "../product-form";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  product_addons: { id: string; name: string; price: number; sort_order: number }[];
};
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductRow | null | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: prod }, { data: cats }, { data: subs }, { data: products }] = await Promise.all([
        supabase
          .from("products")
          .select("*, product_addons(*)")
          .eq("id", id)
          .single(),
        supabase.from("categories").select("id,name").order("name"),
        supabase.from("subcategories").select("id,name,category_id").order("name"),
        supabase.from("products").select("tags"),
      ]);
      setProduct((prod as unknown as ProductRow) ?? null);
      setCategories(cats ?? []);
      setSubcategories(subs ?? []);
      const tagSet = new Set<string>();
      for (const p of products ?? []) for (const t of p.tags) tagSet.add(t);
      setAllTags(Array.from(tagSet).sort());
    })();
  }, [id]);

  if (product === undefined) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />;
  if (product === null) return <p className="text-center text-sm text-muted-foreground">Product not found.</p>;

  return (
    <ProductForm product={product} categories={categories} subcategories={subcategories} allTags={allTags} />
  );
}
