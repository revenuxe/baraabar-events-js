"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Gift, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { GalleryUploadField } from "@/components/admin/GalleryUploadField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TagInput } from "@/components/admin/TagInput";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryOption = { id: string; name: string };
type SubcategoryOption = { id: string; name: string; category_id: string };
type AddonOption = { id: string; name: string; price: number };

const TABS = [
  { key: "details", label: "Details" },
  { key: "pricing", label: "Pricing" },
  { key: "media", label: "Media" },
  { key: "content", label: "Content" },
  { key: "seo", label: "SEO" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({
  product,
  categories,
  subcategories,
  allTags,
  allAddons,
  selectedAddonIds: initialSelectedAddonIds,
  defaultCategoryId,
  defaultSubcategoryId,
}: {
  /** null = creating a new product */
  product: ProductRow | null;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  allTags: string[];
  /** The shared add-ons library to pick from. */
  allAddons: AddonOption[];
  /** Add-on ids already linked to this product. */
  selectedAddonIds?: string[];
  /** Pre-selects category/subcategory when arriving from the sidebar's "+" shortcut. */
  defaultCategoryId?: string;
  defaultSubcategoryId?: string;
}) {
  const router = useRouter();
  const isNew = !product;
  const [tab, setTab] = useState<TabKey>("details");

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [subcategoryId, setSubcategoryId] = useState(
    product?.subcategory_id ?? defaultSubcategoryId ?? "",
  );
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [isTrending, setIsTrending] = useState(product?.is_trending ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0);

  const [price, setPrice] = useState(product?.price ?? 0);
  const [salePrice, setSalePrice] = useState<number | "">(product?.sale_price ?? "");

  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const [included, setIncluded] = useState<string[]>(product?.included ?? [""]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(initialSelectedAddonIds ?? []);
  const [rating, setRating] = useState(product?.rating ?? 4.8);
  const [reviewCount, setReviewCount] = useState(product?.review_count ?? 0);

  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(product?.og_image_url ?? null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorySubcategories = useMemo(
    () => subcategories.filter((s) => s.category_id === categoryId),
    [subcategories, categoryId],
  );

  const discountPct =
    salePrice !== "" && price > 0 ? Math.round(((price - Number(salePrice)) / price) * 100) : 0;

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function updateIncluded(i: number, v: string) {
    setIncluded((items) => items.map((it, idx) => (idx === i ? v : it)));
  }
  function removeIncluded(i: number) {
    setIncluded((items) => items.filter((_, idx) => idx !== i));
  }
  function addIncluded() {
    setIncluded((items) => [...items, ""]);
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setTab("details");
      return setError("Name is required");
    }
    if (!slug.trim()) {
      setTab("details");
      return setError("Slug is required");
    }
    if (!categoryId) {
      setTab("details");
      return setError("Category is required");
    }
    if (price <= 0) {
      setTab("pricing");
      return setError("Price must be greater than 0");
    }
    if (salePrice !== "" && Number(salePrice) > price) {
      setTab("pricing");
      return setError("Sale price can't be higher than the regular price");
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      price,
      sale_price: salePrice === "" ? null : Number(salePrice),
      images,
      included: included.map((i) => i.trim()).filter(Boolean),
      tags,
      is_trending: isTrending,
      is_featured: isFeatured,
      is_active: isActive,
      sort_order: sortOrder,
      rating,
      review_count: reviewCount,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      og_image_url: ogImageUrl,
    };

    const { data: savedProduct, error: saveError } = isNew
      ? await supabase.from("products").insert(payload).select("id").single()
      : await supabase.from("products").update(payload).eq("id", product.id).select("id").single();

    if (saveError || !savedProduct) {
      setError(saveError?.message ?? "Could not save product");
      setSaving(false);
      return;
    }

    const productId = savedProduct.id;
    // Simplest correct approach for a short link list: replace wholesale
    // rather than diffing inserts/updates/deletes.
    await supabase.from("product_addon_links").delete().eq("product_id", productId);
    if (selectedAddonIds.length) {
      await supabase.from("product_addon_links").insert(
        selectedAddonIds.map((addonId) => ({ product_id: productId, addon_id: addonId })),
      );
    }

    setSaving(false);
    router.push("/admin/dashboard/products");
  }

  return (
    <section className="mx-auto max-w-4xl">
      <Link
        href="/admin/dashboard/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{isNew ? "New product" : `Edit ${product.name}`}</h2>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {/* Tab bar */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                tab === t.key ? "bg-gradient-brand text-primary-foreground shadow-glow" : "hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-5">
          {tab === "details" && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Name" required>
                  <input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="Slug" required>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="Category" required>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId("");
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Subcategory">
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {categorySubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {categorySubcategories.length === 0 && (
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      No subcategories under this category yet.
                    </span>
                  )}
                </Field>
                <Field label="Tagline" className="md:col-span-2">
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
              </div>

              <div className="border-t border-border pt-4">
                <Field label="Tags">
                  <TagInput value={tags} onChange={setTags} suggestions={allTags} />
                </Field>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Toggle label="Trending" checked={isTrending} onChange={setIsTrending} />
                  <Toggle label="Featured" checked={isFeatured} onChange={setIsFeatured} />
                  <Toggle label="Active" checked={isActive} onChange={setIsActive} />
                  <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    Sort order
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {tab === "pricing" && (
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Price (₹)" required>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Sale price (₹)">
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <div className="flex flex-col justify-end">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Discount
                </span>
                <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm font-bold text-gradient-brand">
                  {discountPct > 0 ? `${discountPct}% off` : "—"}
                </p>
              </div>
            </div>
          )}

          {tab === "media" && (
            <GalleryUploadField
              value={images}
              onChange={setImages}
              pathPrefix={`products/${product?.id ?? "new"}`}
            />
          )}

          {tab === "content" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  What&apos;s included
                </h3>
                <div className="space-y-2">
                  {included.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateIncluded(i, e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeIncluded(i)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIncluded}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add line
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Add-ons</h3>
                  <Link
                    href="/admin/dashboard/addons/new"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    <Plus className="h-3 w-3" /> New add-on
                  </Link>
                </div>
                {allAddons.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No add-ons in your library yet. Create some from the Add-ons tab, then assign them here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allAddons.map((addOn) => {
                      const selected = selectedAddonIds.includes(addOn.id);
                      return (
                        <button
                          key={addOn.id}
                          type="button"
                          onClick={() => toggleAddon(addOn.id)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                            selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border bg-background"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                                selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                              }`}
                            >
                              {selected && <Check className="h-3 w-3" />}
                            </span>
                            <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold">{addOn.name}</span>
                          </span>
                          <span className="text-sm font-bold">₹{addOn.price.toLocaleString("en-IN")}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Rating (no live reviews yet — set manually)
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Rating (0–5)">
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={5}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </Field>
                  <Field label="Review count">
                    <input
                      type="number"
                      min={0}
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-3">
              <Field label="Meta title">
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={`${name || "Product name"} | Baraabar`}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Meta description">
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={tagline || "Falls back to the tagline"}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Social share image (OG image)">
                <ImageUploadField
                  value={ogImageUrl}
                  onChange={setOgImageUrl}
                  pathPrefix={`products/${product?.id ?? "new"}/seo`}
                />
              </Field>
            </div>
          )}
        </div>

        {error && (
          <p className="mx-5 mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Link
            href="/admin/dashboard/products"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[color:var(--brand-purple)]"
      />
      {label}
    </label>
  );
}
