"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "catalog-images";

/** Sniffs the first bytes against known image magic numbers instead of
 * trusting file.type/extension — both are reported by the OS, and phones
 * occasionally hand over something that isn't actually an image under an
 * image-looking name. Catching that here means it never reaches storage in
 * the first place, rather than surfacing later as a broken thumbnail. */
async function looksLikeImage(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return true; // JPEG
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return true; // PNG
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return true; // GIF
  if (head[0] === 0x42 && head[1] === 0x4d) return true; // BMP
  if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) return true; // WEBP (RIFF)
  if (String.fromCharCode(head[4], head[5], head[6], head[7]) === "ftyp") return true; // HEIC/HEIF
  return false;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}

/** Uploads a file directly to the `catalog-images` Supabase Storage bucket
 * from the browser, authorized by the signed-in admin's session — no
 * server round-trip needed, the bucket's RLS policies gate the write. */
export async function uploadCatalogImage(file: File, pathPrefix: string): Promise<string> {
  if (!(await looksLikeImage(file))) {
    throw new Error(`"${file.name}" doesn't look like a valid image — try saving the photo again`);
  }
  const supabase = createClient();
  const key = `${pathPrefix}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

function catalogImageKeyFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

/** Best-effort delete — failures are swallowed since this is always cleanup
 * (replacing/removing an image), never something the user is blocked on.
 * Silently no-ops for URLs that aren't in this bucket (e.g. a pasted
 * external URL). */
export async function deleteCatalogImage(url: string): Promise<void> {
  const key = catalogImageKeyFromUrl(url);
  if (!key) return;
  try {
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([key]);
  } catch {
    // Swallowed — see comment above.
  }
}
