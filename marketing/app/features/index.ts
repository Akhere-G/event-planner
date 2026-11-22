import { accommodationFeature } from "./content/accommodation";
import { aiProposalsFeature } from "./content/ai-proposals";
import { aiTripGeneratorFeature } from "./content/ai-trip-generator";
import { collaborationRolesFeature } from "./content/collaboration-roles";
import { directionsFeature } from "./content/directions";
import { fillInMyDayFeature } from "./content/fill-in-my-day";
import { flightSearchFeature } from "./content/flight-search";
import { googleCalendarSyncFeature } from "./content/google-calendar-sync";
import { googleMapsPlaceSearchFeature } from "./content/google-maps-place-search";
import { groupExpensesFeature } from "./content/group-expenses";
import { packingListsFeature } from "./content/packing-lists";
import { smartDayOptimiserFeature } from "./content/smart-day-optimiser";
import { tripCalendarFeature } from "./content/trip-calendar";
import { tripTemplatesExportFeature } from "./content/trip-templates-export";
import { wishlistVotingFeature } from "./content/wishlist-voting";
import type { FeaturePage } from "./types";

export const featurePages: FeaturePage[] = [
  aiTripGeneratorFeature,
  collaborationRolesFeature,
  groupExpensesFeature,
  smartDayOptimiserFeature,
  aiProposalsFeature,
  fillInMyDayFeature,
  wishlistVotingFeature,
  googleMapsPlaceSearchFeature,
  directionsFeature,
  tripCalendarFeature,
  googleCalendarSyncFeature,
  flightSearchFeature,
  accommodationFeature,
  packingListsFeature,
  tripTemplatesExportFeature,
];

export function featurePath(slug: string): string {
  return `/features/${slug}`;
}

export function getFeature(slug: string): FeaturePage | undefined {
  return featurePages.find((feature) => feature.slug === slug);
}
