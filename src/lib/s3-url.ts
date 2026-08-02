// Pure string helpers for building/parsing S3 object URLs — no AWS SDK, no
// server-only import, so both the API route (server) and upload widgets
// (client) can share the exact same URL shape without duplicating it.

const BUCKET = process.env.AWS_S3_BUCKET_NAME ?? "";
const REGION = process.env.AWS_REGION ?? "";
// Optional CDN/custom-domain override (e.g. a CloudFront distribution) —
// falls back to the standard virtual-hosted-style S3 URL.
const PUBLIC_BASE_URL = (process.env.AWS_S3_PUBLIC_URL ?? `https://${BUCKET}.s3.${REGION}.amazonaws.com`).replace(
  /\/$/,
  "",
);

export function s3PublicUrl(key: string): string {
  return `${PUBLIC_BASE_URL}/${key}`;
}

/** Recovers the object key from a URL previously built by `s3PublicUrl`, so
 * a stored `image_url` can be deleted without also persisting a separate
 * key column. Returns null for URLs that don't look like ours (e.g. a
 * legacy Supabase Storage URL from before this migration). */
export function s3KeyFromUrl(url: string): string | null {
  if (!url.startsWith(`${PUBLIC_BASE_URL}/`)) return null;
  const key = url.slice(PUBLIC_BASE_URL.length + 1);
  return key || null;
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}
