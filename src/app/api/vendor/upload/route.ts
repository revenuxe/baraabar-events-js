import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";
import { s3Client, AWS_S3_BUCKET_NAME } from "@/lib/s3";
import { s3PublicUrl } from "@/lib/s3-url";
import { looksLikeImage, sanitizeFileName } from "@/lib/image-sniff";

// Unlike api/upload/route.ts (admin-only, trusts any pathPrefix an admin
// supplies), this route builds the S3 key itself from a booking id it has
// independently verified belongs to the calling vendor — a vendor never
// gets to name their own upload path.
async function requireVendorForBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();
  if (!vendor) return null;

  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("assigned_vendor_id", vendor.id)
    .maybeSingle();
  if (!booking) return null;

  return vendor;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const bookingId = form.get("bookingId");
  const kind = form.get("kind");

  if (!(file instanceof File) || typeof bookingId !== "string" || !bookingId) {
    return NextResponse.json({ error: "Missing file or bookingId" }, { status: 400 });
  }
  if (kind !== "setup" && kind !== "completion") {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  const vendor = await requireVendorForBooking(bookingId);
  if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buffer)) {
    return NextResponse.json(
      { error: `"${file.name}" doesn't look like a valid image — try saving the photo again` },
      { status: 400 },
    );
  }

  const key = `bookings/${bookingId}/${kind}/${Date.now()}-${sanitizeFileName(file.name)}`;
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
