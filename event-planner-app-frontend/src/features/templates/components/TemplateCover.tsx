import { useState } from "react";
import { UnsplashCredit } from "../../../components";
import type { TemplateSummary } from "../types";

interface TemplateCoverProps {
  template: TemplateSummary;
  className?: string;
}

// Curated covers ship with the app; the Unsplash photo fills in for the rest.
export default function TemplateCover({
  template,
  className = "",
}: TemplateCoverProps) {
  const [failed, setFailed] = useState(false);
  const { coverImage, backgroundImageUrl, destination } = template;
  const src = coverImage ?? backgroundImageUrl;

  if (!src || failed) {
    return (
      <div
        aria-hidden
        className={`bg-linear-to-r from-brand-primary to-brand-secondary ${className}`}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={`${destination} cover`}
        loading="lazy"
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
      {!coverImage && (
        <UnsplashCredit
          image={template}
          className="absolute bottom-2 right-2 z-10"
        />
      )}
    </div>
  );
}
