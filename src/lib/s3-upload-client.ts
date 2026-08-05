"use client";

/** Uploads a file to AWS S3 via /api/upload — the browser never sees AWS
 * credentials; the route handler holds those and does the actual S3 call.
 * `pathPrefix` mirrors the old Supabase Storage layout (e.g.
 * "categories/<id>", "products/<id>") so existing admin form call sites
 * don't need to change. */
export async function uploadCatalogImage(file: File, pathPrefix: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("pathPrefix", pathPrefix);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

/** Best-effort delete — failures are swallowed since this is always cleanup
 * (replacing/removing an image), never something the user is blocked on. */
export async function deleteCatalogImage(url: string): Promise<void> {
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Swallowed — see comment above.
  }
}
