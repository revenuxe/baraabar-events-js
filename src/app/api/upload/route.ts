import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";
import { s3Client, AWS_S3_BUCKET_NAME } from "@/lib/s3";
import { s3PublicUrl, s3KeyFromUrl } from "@/lib/s3-url";
import { looksLikeImage, sanitizeFileName } from "@/lib/image-sniff";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return isAdmin ? user : null;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Every path out of this handler must be JSON, even on an unexpected
  // throw (e.g. missing/invalid AWS credentials) — otherwise Vercel's
  // platform-level 500 page (HTML) reaches the client and breaks
  // `res.json()` there with a confusing "Unexpected token '<'" instead of
  // a real error message.
  try {
    const form = await request.formData();
    const file = form.get("file");
    const pathPrefix = form.get("pathPrefix");
    if (!(file instanceof File) || typeof pathPrefix !== "string" || !pathPrefix) {
      return NextResponse.json({ error: "Missing file or pathPrefix" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!looksLikeImage(buffer)) {
      return NextResponse.json(
        { error: `"${file.name}" doesn't look like a valid image — try saving the photo again` },
        { status: 400 },
      );
    }

    const key = `${pathPrefix}/${Date.now()}-${sanitizeFileName(file.name)}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return NextResponse.json({ url: s3PublicUrl(key) });
  } catch (err) {
    console.error("[api/upload POST]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url } = (await request.json()) as { url?: string };
    const key = url ? s3KeyFromUrl(url) : null;
    // No-op for URLs that aren't in this bucket (e.g. a pasted external URL)
    // — deletes are always best-effort cleanup, never something to fail on.
    if (!key) return NextResponse.json({ ok: true });

    await s3Client.send(new DeleteObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key: key }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/upload DELETE]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed" }, { status: 500 });
  }
}
