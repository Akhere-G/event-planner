import type { GuideImage, PhotoSource } from "../destinations/types";

const SOURCE_HOMEPAGES: Record<PhotoSource, string> = {
  Unsplash: "https://unsplash.com/",
  Pexels: "https://www.pexels.com/",
};

// Unsplash's attribution guidelines ask for these referral parameters on every link.
const REFERRAL = "utm_source=triptrack&utm_medium=referral";

function withReferral(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${REFERRAL}`;
}

export function PhotoCredit({ credit }: { credit: GuideImage["credit"] }) {
  return (
    <>
      Photo by{" "}
      <a href={withReferral(credit.url)} className="underline" rel="noopener">
        {credit.name}
      </a>{" "}
      on{" "}
      <a
        href={withReferral(SOURCE_HOMEPAGES[credit.source])}
        className="underline"
        rel="noopener"
      >
        {credit.source}
      </a>
    </>
  );
}
