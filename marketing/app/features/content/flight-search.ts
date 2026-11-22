import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const flightSearchFeature: FeaturePage = {
  slug: "flight-search",
  name: "Flight search",
  title: "Flight search for group trips: find, save and share flight details",
  description:
    "Search flights by route or flight number, save the journey to your trip and let the whole group see times, airports and costs on the itinerary.",
  primaryKeyword: "group trip flight planner",
  secondaryKeywords: [
    "flight search for group trips",
    "save flight details to itinerary",
    "share flight times with friends",
  ],
  screenshots: [
    featureScreenshot(
      "flight-search-1",
      "Saved Ryanair flight from London Stansted to Lisbon with departure, arrival and a £69 linked expense",
      "Saved flights sit on the trip with local times, airports and the cost the group is splitting.",
    ),
    featureScreenshot(
      "flight-search-2",
      "Flight search panel with route and flight-number options, departure airport, destination and date fields",
      "Search by route or by flight number, then save the journey you have booked.",
    ),
  ],
  summary:
    "Flight search and saved flight details keep everyone's travel times in one place. Search by route or flight number, save each leg to the trip, and the flights appear on the right days of the itinerary and calendar.",
  steps: [
    {
      title: "Search by route or flight number",
      body: "Pick a departure city or airport, a destination and a date, or type a flight number if you have already booked.",
    },
    {
      title: "Save the journey to the trip",
      body: "Choose a result and save it. Journeys with more than one leg are saved as separate flights, each with its own times and airports.",
    },
    {
      title: "See it on the itinerary",
      body: "Flights show on the right day in the list and calendar views, so nobody plans brunch for the morning you are still in the air.",
    },
    {
      title: "Split the cost",
      body: "Add the fare as an expense linked to the flight. A priced multi-leg journey becomes one expense on the first leg, not one per leg.",
    },
  ],
  benefits: [
    "Everyone in the group sees the same departure and arrival times instead of scrolling back through the chat for a screenshot.",
    "Times are stored against each airport's time zone, so a late arrival into Lisbon or Kraków shows in local time.",
    "AI planning tools treat flights as busy time: day suggestions avoid the three hours before departure and the two hours after arrival.",
    "Fares can be logged as shared expenses, so the person who booked for everyone gets paid back.",
  ],
  limits: [
    "TripTrack does not sell or book flights. Results may link to a booking site, and the purchase happens there.",
    "This is flight search and saved flight details, not live tracking. There are no delay or gate-change alerts.",
    "Search results are cached for up to a day, so prices and schedules can be out of date. Check with the airline before you book.",
  ],
  faqs: [
    {
      question: "Can I book flights in TripTrack?",
      answer:
        "No. You can search, compare and save flight details, and some results include a link to a booking site. The booking itself is made outside TripTrack.",
    },
    {
      question: "Does TripTrack send flight delay alerts?",
      answer:
        "No. TripTrack stores the flight details you save and shows them on the itinerary. It does not track flights in real time, so check the airline's own updates on the day.",
    },
    {
      question: "Can I add a flight I booked somewhere else?",
      answer:
        "Yes. Search by flight number and date, pick the matching flight and save it to the trip.",
    },
  ],
  relatedFeatureSlugs: ["group-expenses", "trip-calendar", "fill-in-my-day"],
  relatedArticleSlugs: ["triptrack-vs-tripit", "travel-planning-checklist"],
};
