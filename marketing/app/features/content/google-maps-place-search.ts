import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const googleMapsPlaceSearchFeature: FeaturePage = {
  slug: "google-maps-place-search",
  name: "Google Maps place search",
  title: "Search Google Maps places and add them straight to your trip",
  description:
    "Search the map or tap a preset such as bars, restaurants or viewpoints, check ratings and opening status, and add a place to a day or a wishlist.",
  primaryKeyword: "trip planner with map",
  secondaryKeywords: [
    "find bars near me on holiday",
    "add places to itinerary from map",
    "itinerary map planner",
  ],
  screenshots: [
    featureScreenshot(
      "google-maps-place-search-1",
      "Map search results for bars in Lisbon with a selected bar showing rating, address, open status and an Add button",
      "Tap a preset like Bars, browse results on the map and add a place in one step.",
    ),
  ],
  summary:
    "Place search uses Google Maps inside your trip. Type a search or tap a preset, look at ratings, photos and whether a place is open, then save it to a day of the itinerary or to a wishlist.",
  steps: [
    {
      title: "Open the map search",
      body: "Use the search button on the trip map and type a place or a kind of place.",
    },
    {
      title: "Or tap a preset",
      body: "Presets cover restaurants, things to do, bars, clubs, restrooms, ATMs, pharmacies, viewpoints, markets, live music, parks, groceries and laundry.",
    },
    {
      title: "Compare results",
      body: "Step through results to see the rating, address, photos and whether it's open. Move the map and search again for a different area.",
    },
    {
      title: "Add it to the trip",
      body: "Save the place to a date as an event or to one of the trip's wishlists.",
    },
  ],
  benefits: [
    "Find a late bar, a pharmacy or a cash machine near the group without switching apps.",
    "Places land on the shared plan, not in one person's saved list.",
    "Wishlists let you collect options now and vote later.",
    "Every saved place gets a pin on the trip map, so you can see how spread out the day is.",
  ],
  limits: [
    "Place details, ratings and opening status come from Google and can be out of date.",
    "Search needs an internet connection. There's no offline map.",
  ],
  faqs: [
    {
      question: "Where do place details come from?",
      answer:
        "From Google Maps and Google Places. TripTrack shows them inside the trip and saves the place's name, address and location when you add it.",
    },
    {
      question: "Can I add a place without picking a time?",
      answer:
        "Yes. Save it to a wishlist and schedule it later.",
    },
  ],
  relatedFeatureSlugs: ["wishlist-voting", "directions", "fill-in-my-day"],
  relatedArticleSlugs: ["how-to-create-travel-itinerary", "tokyo-vs-seoul"],
};
