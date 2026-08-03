"use client";

/** Sniffs the first bytes against known image magic numbers instead of
 * trusting file.type/extension — both are reported by the OS, and phones
 * occasionally hand over something that isn't actually an image under an
 * image-looking name (e.g. "save image" from Instagram silently saving the
 * share page's redirect HTML instead of the photo when scraping is
 * blocked). Catching that here means it never reaches S3 in the first
 * place, rather than surfacing later as a broken thumbnail. */
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

/** Uploads a file straight to S3 via a presigned URL obtained from
 * /api/upload — the file bytes go browser -> S3 directly, never through
 * our server. Throws with a user-readable message on failure. */
export async function uploadFileToS3(
  file: File,
  kind: "catalog" | "reference",
  pathPrefix?: string,
): Promise<string> {
  if (!(await looksLikeImage(file))) {
    throw new Error(`"${file.name}" doesn't look like a valid image — try saving the photo again`);
  }

  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, filename: file.name, contentType: file.type, pathPrefix }),
  });
  if (!presignRes.ok) {
    const { error } = await presignRes.json().catch(() => ({ error: undefined }));
    throw new Error(error ?? "Couldn't start the upload");
  }
  const { uploadUrl, publicUrl } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload to storage failed");

  return publicUrl;
}

/** Best-effort delete — failures are swallowed since this is always
 * cleanup (replacing/removing an image), never something the user is
 * blocked on. */
export async function deleteS3Upload(url: string): Promise<void> {
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
