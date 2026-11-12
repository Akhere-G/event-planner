export type DestinationRegion = "Asia" | "Europe" | "North America";

export interface GuidePlace {
  name: string;
  area: string;
  description: string;
}

export interface DestinationGuide {
  slug: string;
  city: string;
  country: string;
  region: DestinationRegion;
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
