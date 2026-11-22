import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const wishlistVotingFeature: FeaturePage = {
  slug: "wishlist-voting",
  name: "Wishlist and voting",
  title: "Let the group vote on what to do",
  description:
    "Collect ideas in shared wishlists, let everyone vote thumbs up or down, then turn the winners into scheduled events.",
  primaryKeyword: "group trip voting app",
  secondaryKeywords: [
    "vote on trip activities",
    "shared travel wishlist",
    "decide what to do on a group holiday",
  ],
  screenshots: [
    featureScreenshot(
      "wishlist-voting-1",
      "Wishlist of Lisbon ideas including Pena Palace and a spa, each with thumbs up and thumbs down vote counts",
      "Every idea shows its votes, so the group's favourites are obvious.",
    ),
  ],
  summary:
    "Wishlists hold the ideas you haven't committed to yet. Anyone on the trip can vote, and when the group agrees, promote an item to the itinerary with a time.",
  steps: [
    {
      title: "Create a wishlist",
      body: "Start a list, such as “Saturday night options” or “day trips”. A trip can have several.",
    },
    {
      title: "Add ideas",
      body: "Add places from search or the map. Each item keeps its address, location and a note.",
    },
    {
      title: "Vote",
      body: "Every member, including viewers, can give each idea a thumbs up or thumbs down.",
    },
    {
      title: "Promote the winners",
      body: "Pick a start and end time to turn an item into an event on the itinerary.",
    },
  ],
  benefits: [
    "Settles “what do you lot want to do?” without a 200-message thread.",
    "Quieter members get a say, because a vote takes one tap.",
    "Wishlist places show as pins on the trip map, so you can see what's near your plans.",
    "The AI trip generator can seed a wishlist with places to vote on.",
  ],
  limits: [
    "Votes are a simple thumbs up or down. There's no ranked choice or deadline.",
    "Scheduling the winning idea is a manual step.",
  ],
  faqs: [
    {
      question: "Can viewers vote?",
      answer:
        "Yes. Admins, editors and viewers can all vote on wishlist items.",
    },
    {
      question: "How do I add a wishlist item to the itinerary?",
      answer:
        "Promote it and choose a start and end time. It becomes a scheduled event on that day.",
    },
  ],
  relatedFeatureSlugs: ["collaboration-roles", "google-maps-place-search", "ai-trip-generator"],
  relatedArticleSlugs: ["how-to-plan-a-group-holiday", "best-group-holiday-destinations-2027"],
};
