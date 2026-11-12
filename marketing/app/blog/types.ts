export type BlogRegion = "Asia" | "Europe" | "North America";

export interface BlogPlace {
  name: string;
  area: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  city: string;
  country: string;
  region: BlogRegion;
  title: string;
  description: string;
  intro: string[];
  bestTime: string;
  restaurants: BlogPlace[];
  thingsToDo: BlogPlace[];
  whereToStay: BlogPlace[];
  hiddenGems: BlogPlace[];
  templateSlug: string;
  templateTitle: string;
  templateDays: number;
  publishedAt: string;
}
