export const TEMPLATE_REGIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

export type TemplateRegion = (typeof TEMPLATE_REGIONS)[number];

export const TEMPLATES_PAGE_SIZE = 12;
