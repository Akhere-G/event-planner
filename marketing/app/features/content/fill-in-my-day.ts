import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const fillInMyDayFeature: FeaturePage = {
  slug: "fill-in-my-day",
  name: "Fill in my day",
  title: "Fill in my day: ideas for the gaps in your trip",
  description:
    "Tell TripTrack the pace, who's going, how you're getting around and what you're into, and get suggestions for an empty or half-planned day.",
  primaryKeyword: "what to do today itinerary ideas",
  secondaryKeywords: [
    "fill a day on holiday",
    "day itinerary suggestions",
    "things to do on a city break",
  ],
  screenshots: [
    featureScreenshot(
      "fill-in-my-day-1",
      "Fill Day 1 form with pace, travel companions, transport and focus areas such as sightseeing and food",
      "Choose the pace, the group, how you'll get around and what you want from the day.",
    ),
    featureScreenshot(
      "ai-proposals-1",
      "Review proposed changes with four suggested events for the day, each with time, address and reason",
      "Suggestions arrive as a proposal with times and reasons. Keep the ones you like.",
    ),
  ],
  summary:
    "Fill in my day suggests events for a gap in the itinerary. It works around what's already planned and around your flights, then hands you a list to accept, trim or reject.",
  steps: [
    {
      title: "Open the day menu",
      body: "On any day in the list view, choose Fill in day.",
    },
    {
      title: "Describe the day",
      body: "Choose a pace (relaxed, balanced or packed), who's travelling, how you're getting around and the focus areas you care about, from food and bars to museums and hidden gems. Your trip preferences fill these in to start.",
    },
    {
      title: "Keep using the app",
      body: "The suggestions are prepared in the background and you'll be told when they're ready.",
    },
    {
      title: "Pick what to keep",
      body: "Review the suggested events, untick any you don't want and apply the rest.",
    },
  ],
  benefits: [
    "Gets a spare afternoon on a birthday weekend sorted without five people sending links.",
    "Suggestions are timed around existing plans and flights, so they fit the day you actually have.",
    "Friends, couples and families get different suggestions for the same city.",
    "Each suggestion comes with a short reason, so the group can decide quickly.",
  ],
  limits: [
    "Suggestions can be wrong or out of date. Check opening times and prices before you go.",
    "It suggests events only. Accommodation and bookings are up to you.",
  ],
  faqs: [
    {
      question: "Does Fill in my day overwrite my plans?",
      answer:
        "No. It proposes new events for the gaps, and you choose which to add.",
    },
    {
      question: "Does it know about my flight?",
      answer:
        "Yes. Saved flights block time from three hours before departure until two hours after arrival, and suggestions that overlap are rejected.",
    },
  ],
  relatedFeatureSlugs: ["ai-proposals", "smart-day-optimiser", "google-maps-place-search"],
  relatedArticleSlugs: ["how-to-create-travel-itinerary", "paris-vs-amsterdam"],
};
