import type { DestinationGuide } from "../types";
import { amsterdamGuide } from "./amsterdam";
import { baliGuide } from "./bali";
import { bangkokGuide } from "./bangkok";
import { barcelonaGuide } from "./barcelona";
import { budapestGuide } from "./budapest";
import { hanoiGuide } from "./hanoi";
import { lisbonGuide } from "./lisbon";
import { newYorkGuide } from "./new-york";
import { parisGuide } from "./paris";
import { pragueGuide } from "./prague";
import { romeGuide } from "./rome";
import { seoulGuide } from "./seoul";
import { tokyoGuide } from "./tokyo";

export const destinationGuides: DestinationGuide[] = [
  bangkokGuide,
  tokyoGuide,
  seoulGuide,
  hanoiGuide,
  baliGuide,
  parisGuide,
  barcelonaGuide,
  amsterdamGuide,
  pragueGuide,
  lisbonGuide,
  romeGuide,
  budapestGuide,
  newYorkGuide,
];

export function getGuide(slug: string): DestinationGuide | undefined {
  return destinationGuides.find((guide) => guide.slug === slug);
}
