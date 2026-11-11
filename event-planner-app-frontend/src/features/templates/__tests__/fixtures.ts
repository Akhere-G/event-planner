import type { TemplateDetail, TemplatePin, TemplateSummary } from "../types";

export const ok = <T>(data: T) => ({ success: true, data });

export function summary(
  overrides: Partial<TemplateSummary> = {},
): TemplateSummary {
  return {
    slug: "paris-4-days-itinerary",
    title: "Paris in 4 days",
    description: "A first visit to Paris.",
    destination: "Paris, France",
    region: "Europe",
    latitude: 48.85,
    longitude: 2.35,
    durationDays: 4,
    coverImage: null,
    authorName: null,
    cloneCount: 3,
    createdAt: "2026-11-01T00:00:00",
    eventCount: 12,
    placeCount: 6,
    ...overrides,
  };
}

export function pin(overrides: Partial<TemplatePin> = {}): TemplatePin {
  return {
    slug: "paris-4-days-itinerary",
    title: "Paris in 4 days",
    destination: "Paris, France",
    region: "Europe",
    latitude: 48.85,
    longitude: 2.35,
    ...overrides,
  };
}

export function detail(
  overrides: Partial<TemplateDetail> = {},
): TemplateDetail {
  return {
    ...summary(),
    timezone: "Europe/Paris",
    days: [
      {
        dayOffset: 0,
        events: [
          {
            name: "Louvre",
            description: "Start with the Mona Lisa.",
            address: "Rue de Rivoli, Paris",
            latitude: 48.86,
            longitude: 2.33,
            category: "culture",
            dayOffset: 0,
            startTime: "09:30",
            endDayOffset: 0,
            endTime: "12:30",
          },
        ],
      },
      { dayOffset: 1, events: [] },
    ],
    accommodations: [
      {
        name: "Hotel Lutetia",
        description: null,
        address: "45 Boulevard Raspail, Paris",
        latitude: 48.85,
        longitude: 2.33,
        startDayOffset: 0,
        endDayOffset: 4,
      },
    ],
    packingItems: [{ name: "Power adapter", category: "Electronics" }],
    wishlistItems: [
      {
        name: "Le Bouillon Chartier",
        wishlistName: "Top restaurants",
        address: "7 Rue du Faubourg Montmartre",
        latitude: 48.87,
        longitude: 2.34,
        description: null,
      },
    ],
    ...overrides,
  };
}
