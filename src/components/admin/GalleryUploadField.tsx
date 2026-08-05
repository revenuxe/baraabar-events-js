"use client";

import { useRef, useState } from "react";
import { GripVertical, Loader2, Plus, X } from "lucide-react";
import { deleteCatalogImage, uploadCatalogImage } from "@/lib/supabase-upload-client";

export function GalleryUploadField({
  value,
  onChange,
  pathPrefix,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  pathPrefix: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadCatalogImage(file, pathPrefix)),
      );
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addUrl() {
    const url = pastedUrl.trim();
    if (!url) return;
    onChange([...value, url]);
    setPastedUrl("");
  }

  function removeAt(i: number) {
    const url = value[i];
    void deleteCatalogImage(url);
    onChange(value.filter((_, idx) => idx !== i));
  }

  function moveTo(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-full bg-gradient-brand px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => moveTo(i, i - 1)}
                disabled={i === 0}
                className="grid h-4 w-4 place-items-center text-white disabled:opacity-30"
                aria-label="Move left"
              >
                <GripVertical className="h-3 w-3 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => moveTo(i, i + 1)}
                disabled={i === value.length - 1}
                className="grid h-4 w-4 place-items-center text-white disabled:opacity-30"
                aria-label="Move right"
              >
                <GripVertical className="h-3 w-3 rotate-90" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="grid h-24 w-24 shrink-0 place-items-center rounded-xl border border-dashed border-border text-muted-foreground disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            e.target.value = "";
            if (files && files.length) void handleFiles(files);
          }}
        />
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={pastedUrl}
          onChange={(e) => setPastedUrl(e.target.value)}
          placeholder="…or paste an image URL"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={addUrl}
          className="shrink-0 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
