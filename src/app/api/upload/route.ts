import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";
import { s3Client, AWS_S3_BUCKET_NAME } from "@/lib/s3";
import { s3PublicUrl, s3KeyFromUrl } from "@/lib/s3-url";

/** Sniffs the first bytes against known image magic numbers instead of
 * trusting the reported content-type — see the identical client-side check
 * this replaces in the old supabase-upload-client.ts; done server-side here
 * since this route, not the browser, is what talks to S3. */
function looksLikeImage(bytes: Uint8Array): boolean {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true; // JPEG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true; // PNG
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return true; // GIF
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return true; // BMP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return true; // WEBP (RIFF)
  if (String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp") return true; // HEIC/HEIF
  return false;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}

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
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = (await request.json()) as { url?: string };
  const key = url ? s3KeyFromUrl(url) : null;
  // No-op for URLs that aren't in this bucket (e.g. a pasted external URL)
  // — deletes are always best-effort cleanup, never something to fail on.
  if (!key) return NextResponse.json({ ok: true });

  await s3Client.send(new DeleteObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key: key }));
  return NextResponse.json({ ok: true });
}
