"use client";

/** Uploads a file straight to S3 via a presigned URL obtained from
 * /api/upload — the file bytes go browser -> S3 directly, never through
 * our server. Throws with a user-readable message on failure. */
export async function uploadFileToS3(
  file: File,
  kind: "catalog" | "reference",
  pathPrefix?: string,
): Promise<string> {
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
