import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { presignUpload, deleteS3Object } from "@/lib/s3";
import { s3KeyFromUrl, sanitizeFileName } from "@/lib/s3-url";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

type UploadKind = "catalog" | "reference";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return !!data;
}

// POST /api/upload — request a short-lived presigned S3 PUT URL. The file
// itself goes straight from the browser to S3 (never through this
// function), so there's no serverless request-body size limit to worry
// about. Mirrors the old Supabase Storage RLS: catalog images are
// admin-only, reference images are any signed-in user, scoped to their
// own folder (see the key prefix below).
export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const kind = body?.kind as UploadKind | undefined;
  const filename = typeof body?.filename === "string" ? body.filename : undefined;
  const contentType = typeof body?.contentType === "string" ? body.contentType : undefined;
  const pathPrefix = typeof body?.pathPrefix === "string" ? body.pathPrefix : undefined;

  if (!kind || !filename || !contentType) {
    return NextResponse.json({ error: "Missing kind, filename or contentType" }, { status: 400 });
  }
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (kind !== "catalog" && kind !== "reference") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  if (kind === "catalog" && !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const prefix =
    kind === "catalog"
      ? `catalog/${pathPrefix ? sanitizeFileName(pathPrefix) : "misc"}`
      : `reference/${user.id}`;
  const key = `${prefix}/${Date.now()}-${sanitizeFileName(filename)}`;

  try {
    const { uploadUrl, publicUrl } = await presignUpload(key, contentType);
    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/upload — remove a previously uploaded object. Same
// authorization split as POST: catalog images need admin, reference
// images need to be owned by the caller (or an admin).
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : undefined;
  const key = typeof body?.key === "string" ? body.key : (url ? s3KeyFromUrl(url) : null);

  if (!key && !url) {
    return NextResponse.json({ error: "Missing key or url" }, { status: 400 });
  }
  if (!key) {
    // `url` was given but doesn't belong to our bucket — e.g. a legacy
    // Supabase Storage URL from before this migration, or a manually
    // pasted external URL (see ImageUploadField). Nothing for us to
    // delete; that's not the caller's fault.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = await isAdmin(supabase, user.id);
  const ownsReference = key.startsWith(`reference/${user.id}/`);
  const ownsCatalog = key.startsWith("catalog/") && admin;
  if (!ownsCatalog && !ownsReference && !admin) {
    return NextResponse.json({ error: "Not allowed to delete this object" }, { status: 403 });
  }

  try {
    await deleteS3Object(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
