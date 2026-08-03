"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

/** Reference images are whatever a customer's device handed the file
 * input — occasionally that's not actually an image (e.g. a phone's
 * "save image" from Instagram silently saving the redirect HTML page
 * instead of the photo). next/image's optimizer 400s on those, which
 * without this fallback shows as a broken image in the dashboard. */
export function RefImageThumb({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => setBroken(true)}
    />
  );
}
