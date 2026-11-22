import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const accommodationFeature: FeaturePage = {
  slug: "accommodation",
  name: "Accommodation",
  title: "Keep the group's accommodation in one place",
  description:
    "Add where you're staying with the address, dates, notes and cost. It appears on the map and becomes the start and end point for each day's directions.",
  primaryKeyword: "group trip accommodation planner",
  secondaryKeywords: [
    "share hotel details with group",
    "trip accommodation tracker",
    "where are we staying",
  ],
  screenshots: [
    featureScreenshot(
      "accommodation-1",
      "Accommodation tab listing two Lisbon hostels with address, dates, description and an add expense link",
      "Each accommodation card holds the address, dates, notes and the cost the group is splitting.",
    ),
  ],
  summary:
    "Accommodation records where everyone is staying. Search for the place, add the dates and any notes, link the cost, and it shows on the trip map for the whole group.",
  steps: [
    {
      title: "Add the accommodation",
      body: "Search for the hotel, apartment or hostel by name. The address and map pin come from Google Places.",
    },
    {
      title: "Set the dates",
      body: "Add check-in and check-out dates and any notes, such as door codes or who's in which room.",
    },
    {
      title: "Link the cost",
      body: "Add an expense to the accommodation and split it across the group.",
    },
    {
      title: "Plan from it",
      body: "The accommodation pin appears on the map, and View all routes starts and ends each day there.",
    },
  ],
  benefits: [
    "Nobody needs to ask for the address again at 2am.",
    "Several places on one trip are fine, such as two hostels for a big group or a change of base halfway through.",
    "Linking the cost keeps the deposit and the final balance in the group's shared spending.",
  ],
  limits: [
    "TripTrack doesn't book accommodation. Add it once you've booked elsewhere.",
    "Accommodation isn't part of Google Calendar sync.",
  ],
  faqs: [
    {
      question: "Can I book hotels through TripTrack?",
      answer:
        "No. Book wherever you like, then add the details to the trip so everyone can see them.",
    },
    {
      question: "Can the AI suggest accommodation?",
      answer:
        "The trip generator can suggest places to stay as part of a proposal. They are ideas to check and book yourself, not reservations.",
    },
  ],
  relatedFeatureSlugs: ["directions", "group-expenses", "google-maps-place-search"],
  relatedArticleSlugs: ["travel-planning-checklist", "prague-vs-budapest"],
};
