import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const aiTripGeneratorFeature: FeaturePage = {
  slug: "ai-trip-generator",
  name: "AI trip generator",
  title: "Describe your trip in one sentence and get a draft itinerary",
  description:
    "Type a sentence like “a hen do in Barcelona for 8 friends in May”. TripTrack creates the trip and drafts events, accommodation ideas, packing items and wishlist places for you to review.",
  primaryKeyword: "AI itinerary generator",
  secondaryKeywords: [
    "plan a trip from one sentence",
    "group trip itinerary generator",
    "stag do itinerary planner",
    "hen do itinerary planner",
  ],
  screenshots: [
    featureScreenshot(
      "ai-trip-generator-1",
      "Add Trip page with a prompt describing a Barcelona hen do for eight friends and a Plan my trip button",
      "Describe the trip in your own words, or fill in the step-by-step form underneath.",
    ),
  ],
  summary:
    "The AI trip generator turns a description into a trip with a first draft of the plan. It reads the destination, dates, budget and group, creates the trip, then prepares suggestions for you to approve.",
  steps: [
    {
      title: "Describe the trip",
      body: "Write who's going, where, roughly when, the budget and the vibe. Prefer forms? The step-by-step form asks about the group, interests, pace, budget and transport instead.",
    },
    {
      title: "TripTrack creates the trip",
      body: "The destination is checked against Google Places, the trip is created and your preferences are saved for later planning.",
    },
    {
      title: "A draft plan is prepared",
      body: "In the background, TripTrack drafts events, accommodation suggestions, packing items and wishlist places.",
    },
    {
      title: "Approve what you want",
      body: "Review the proposal, keep what works and drop the rest. Then invite the group.",
    },
  ],
  benefits: [
    "Gets the organiser from “we should do something for Sam's 30th” to a plan the group can react to in minutes.",
    "The group, pace and interests shape the draft, so a stag weekend and a family city break come out differently.",
    "Wishlist places give the group options to vote on rather than a fixed schedule.",
    "Nothing is booked or saved to the itinerary until you approve it.",
  ],
  limits: [
    "A destination is required. If the sentence has no usable dates, the trip starts 120 days from today and lasts a week, so check the dates.",
    "Accommodation suggestions are ideas, not reservations. TripTrack doesn't book venues or flights.",
    "Invalid suggestions are dropped, so the draft can contain fewer items than you asked for.",
    "Venue quality, availability and timings still need a human check.",
  ],
  faqs: [
    {
      question: "Does the generator book anything?",
      answer:
        "No. It drafts a plan. Accommodation suggestions are not reservations and nothing is purchased.",
    },
    {
      question: "What if I don't know the exact dates yet?",
      answer:
        "TripTrack picks placeholder dates: a start 120 days from today and a seven-day trip. You can change them later.",
    },
    {
      question: "Do I need an account to try it?",
      answer:
        "You can start a trip before you register. Sign in to keep it, invite friends and use account features such as Google Calendar sync.",
    },
  ],
  relatedFeatureSlugs: ["ai-proposals", "wishlist-voting", "trip-templates-export"],
  relatedArticleSlugs: ["how-to-create-travel-itinerary", "best-travel-planning-apps"],
};
