"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}

export function ImageUploadField({
  value,
  onChange,
  pathPrefix,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  pathPrefix: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const path = `${pathPrefix}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("catalog-images").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("catalog-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="Paste an image URL…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {value ? "Change" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
