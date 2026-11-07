import type { AutofillConfig } from "../events/types";
import type { TripPreferences } from "./types";
import type { PreferencesInput } from "./schemas/preferencesSchema";

export function autofillDefaultsFromPreferences(
  preferences: TripPreferences | null | undefined,
): Partial<AutofillConfig> {
  if (!preferences) return {};
  return {
    ...(preferences.pace && { pace: preferences.pace }),
    ...(preferences.tripType && {
      companions:
        preferences.tripType === "family"
          ? "family_with_kids"
          : preferences.tripType,
    }),
    ...(preferences.transport && { transport: preferences.transport }),
    ...(preferences.interests.length && { interests: preferences.interests }),
  };
}

export const emptyPreferences: PreferencesInput = {
  tripType: null,
  groupSize: null,
  vibes: [],
  budgetTier: null,
  pace: null,
  interests: [],
  transport: null,
};

export function preferencesFromApi(
  preferences: TripPreferences | null | undefined,
): PreferencesInput {
  return { ...emptyPreferences, ...preferences };
}
