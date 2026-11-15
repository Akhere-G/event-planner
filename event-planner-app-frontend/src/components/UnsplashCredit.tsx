export interface BackgroundImageFields {
  backgroundImageUrl: string | null;
  backgroundImageCreditName: string | null;
  backgroundImageCreditUrl: string | null;
}

interface UnsplashCreditProps {
  image: BackgroundImageFields;
  className?: string;
}

// Unsplash's API guidelines require these referral parameters on credit links.
const REFERRAL = "utm_source=triptrack&utm_medium=referral";

export default function UnsplashCredit({
  image,
  className = "",
}: UnsplashCreditProps) {
  const { backgroundImageCreditName, backgroundImageCreditUrl } = image;
  if (!backgroundImageCreditName || !backgroundImageCreditUrl) return null;

  return (
    <p
      className={`rounded-sm bg-surface/80 px-2 py-0.5 text-[10px] text-text-primary ${className}`}
    >
      Photo by{" "}
      <a
        href={`${backgroundImageCreditUrl}?${REFERRAL}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-text-primary"
      >
        {backgroundImageCreditName}
      </a>{" "}
      on{" "}
      <a
        href={`https://unsplash.com/?${REFERRAL}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-text-primary"
      >
        Unsplash
      </a>
    </p>
  );
}
