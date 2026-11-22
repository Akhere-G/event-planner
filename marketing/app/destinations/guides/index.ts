import type { DestinationGuide } from "../types";
import { amsterdamGuide } from "./amsterdam";
import { baliGuide } from "./bali";
import { bangkokGuide } from "./bangkok";
import { barcelonaGuide } from "./barcelona";
import { berlinGuide } from "./berlin";
import { budapestGuide } from "./budapest";
import { dubaiGuide } from "./dubai";
import { hanoiGuide } from "./hanoi";
import { ibizaGuide } from "./ibiza";
import { krakowGuide } from "./krakow";
import { lasVegasGuide } from "./las-vegas";
import { lisbonGuide } from "./lisbon";
import { marbellaGuide } from "./marbella";
import { marrakechGuide } from "./marrakech";
import { miamiGuide } from "./miami";
import { mykonosGuide } from "./mykonos";
import { newYorkGuide } from "./new-york";
import { parisGuide } from "./paris";
import { phuketGuide } from "./phuket";
import { pragueGuide } from "./prague";
import { romeGuide } from "./rome";
import { seoulGuide } from "./seoul";
import { splitGuide } from "./split";
import { tenerifeGuide } from "./tenerife";
import { tokyoGuide } from "./tokyo";
import { tulumGuide } from "./tulum";

export const destinationGuides: DestinationGuide[] = [
  bangkokGuide,
  tokyoGuide,
  seoulGuide,
  hanoiGuide,
  baliGuide,
  phuketGuide,
  parisGuide,
  barcelonaGuide,
  amsterdamGuide,
  pragueGuide,
  lisbonGuide,
  romeGuide,
  budapestGuide,
  berlinGuide,
  krakowGuide,
  ibizaGuide,
  marbellaGuide,
  tenerifeGuide,
  mykonosGuide,
  splitGuide,
  dubaiGuide,
  marrakechGuide,
  newYorkGuide,
  miamiGuide,
  lasVegasGuide,
  tulumGuide,
];

export function getGuide(slug: string): DestinationGuide | undefined {
  return destinationGuides.find((guide) => guide.slug === slug);
}
