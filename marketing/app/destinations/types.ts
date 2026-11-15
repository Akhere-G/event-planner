export type DestinationRegion = "Asia" | "Europe" | "North America";

export interface GuidePlace {
  name: string;
  area: string;
  description: string;
}

export interface GuideImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: { name: string; url: string };
}

export interface DestinationGuide {
  slug: string;
  city: string;
  country: string;
  region: DestinationRegion;
  image: GuideImage;
  title: string;
  description: string;
  intro: string[];
  bestTime: string;
  restaurants: GuidePlace[];
  thingsToDo: GuidePlace[];
  whereToStay: GuidePlace[];
  hiddenGems: GuidePlace[];
  templateSlug: string;
  templateTitle: string;
  templateDays: number;
  publishedAt: string;
}
