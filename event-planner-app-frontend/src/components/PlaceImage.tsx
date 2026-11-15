import { useState } from "react";

interface PlaceImageProps {
  src?: string | null;
  className?: string;
}

// Google photo URLs can expire, so a broken image hides instead of showing an icon.
export default function PlaceImage({ src, className = "" }: PlaceImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return null;

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`object-cover bg-surface-muted ${className}`}
    />
  );
}
