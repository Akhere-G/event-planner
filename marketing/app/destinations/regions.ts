import type { DestinationGuide, DestinationRegion } from "./types";

export const REGION_ORDER: DestinationRegion[] = [
  "Asia",
  "Europe",
  "North America",
];

export function groupByRegion(
  guides: DestinationGuide[],
): { region: DestinationRegion; guides: DestinationGuide[] }[] {
  const groups: { region: DestinationRegion; guides: DestinationGuide[] }[] =
    [];
  for (const region of REGION_ORDER) {
    const inRegion: DestinationGuide[] = [];
    for (const guide of guides) {
      if (guide.region === region) {
        inRegion.push(guide);
      }
    }
    if (inRegion.length > 0) {
      groups.push({ region, guides: inRegion });
    }
  }
  return groups;
}
