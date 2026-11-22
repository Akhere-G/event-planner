import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const directionsFeature: FeaturePage = {
  slug: "directions",
  name: "Directions",
  title: "Directions between every stop on your itinerary",
  description:
    "See walking, driving or public transport directions between consecutive stops, or view every leg of the day from your accommodation and back.",
  primaryKeyword: "itinerary directions between stops",
  secondaryKeywords: [
    "route between itinerary stops",
    "day trip route map",
    "walking time between attractions",
  ],
  screenshots: [
    featureScreenshot(
      "directions-1",
      "Map route from a Lisbon hostel to Time Out Market with a 12 minute, 0.9 km leg and step-by-step directions",
      "View all routes walks through the day leg by leg, starting from your accommodation.",
    ),
  ],
  summary:
    "Directions show how to get from one stop to the next without leaving the trip. Check a single leg or step through the whole day, with journey time, distance and turn-by-turn steps from Google Maps.",
  steps: [
    {
      title: "Pick a leg",
      body: "Under any event, choose walking, driving or transit and tap Directions to see the route to the next stop.",
    },
    {
      title: "Or view the whole day",
      body: "From the day menu, choose View all routes. If you've added accommodation for that night, the first leg starts there and the last leg takes you back.",
    },
    {
      title: "Switch modes",
      body: "Change any leg between walking, driving and transit to compare times.",
    },
    {
      title: "Hand over to Google Maps",
      body: "Use Open in Maps to continue the journey in Google Maps on your phone.",
    },
  ],
  benefits: [
    "Shows when a day is unrealistic before you're dragging a group across town in heels.",
    "Journey times help decide whether to walk, get the metro or split a taxi.",
    "Everyone sees the same route, so stragglers can find their own way to the next stop.",
  ],
  limits: [
    "Routes, times and transit details come from Google Maps and can change.",
    "Directions need an internet connection. TripTrack has no offline maps or navigation.",
    "Cycling isn't offered as a directions mode.",
  ],
  faqs: [
    {
      question: "Does TripTrack give turn-by-turn navigation?",
      answer:
        "It shows the route and step-by-step directions for each leg. For live navigation, use Open in Maps to continue in Google Maps.",
    },
    {
      question: "Which travel modes are supported?",
      answer:
        "Walking, driving and public transport.",
    },
  ],
  relatedFeatureSlugs: ["google-maps-place-search", "smart-day-optimiser", "accommodation"],
  relatedArticleSlugs: ["how-to-create-travel-itinerary", "paris-vs-amsterdam"],
};
