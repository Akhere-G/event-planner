import { useState } from "react";

interface TemplateCoverProps {
  src: string | null;
  alt: string;
  className?: string;
}

export default function TemplateCover({
  src,
  alt,
  className = "",
}: TemplateCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden
        className={`bg-linear-to-r from-brand-primary to-brand-secondary ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
