import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const collaborationRolesFeature: FeaturePage = {
  slug: "collaboration-roles",
  name: "Real-time collaboration and roles",
  title: "Plan a group trip together, with roles and live updates",
  description:
    "Invite friends as admins, editors or viewers. Everyone sees changes as they're saved, and you can see who's online and which day they're looking at.",
  primaryKeyword: "collaborative trip planner",
  secondaryKeywords: [
    "plan a trip with friends",
    "group trip planner app",
    "shared itinerary planner",
  ],
  screenshots: [
    featureScreenshot(
      "collaboration-roles-1",
      "Trip members list with one admin, two editors and one viewer, and an Invite User button",
      "Each member has a role: admins manage the trip, editors plan, viewers follow along.",
    ),
  ],
  summary:
    "TripTrack is built for planning with other people. Invite the group, give each person a role, and when anyone saves a change, everyone else's screen updates.",
  steps: [
    {
      title: "Invite the group",
      body: "From the trip's members list, invite friends by email. They accept the invite from their account.",
    },
    {
      title: "Set roles",
      body: "Admins manage the trip and its members. Editors add and change plans. Viewers can see everything and vote on wishlist ideas.",
    },
    {
      title: "Plan at the same time",
      body: "When someone saves a change, other members' screens refresh with it. Avatars show who's online and which day they're viewing.",
    },
  ],
  benefits: [
    "One shared plan replaces the pinned message nobody can find.",
    "Viewer access suits the friends who just want to know where to be and when.",
    "Seeing who's looking at which day helps when you're planning on a call.",
  ],
  limits: [
    "Invited friends need a TripTrack account to join.",
    "If two people change the same item, the last save wins. There's no merged, document-style editing.",
    "A brief loss of connection can delay updates until you're back online.",
  ],
  faqs: [
    {
      question: "What's the difference between admin, editor and viewer?",
      answer:
        "Admins manage the trip, its members and settings. Editors can add and change plans. Viewers can see the trip and vote on wishlist items but can't edit the plan.",
    },
    {
      question: "Do my friends need an account?",
      answer:
        "Yes, to join a trip from an invite. Opening the invite asks them to sign in or create an account first.",
    },
    {
      question: "What happens if two people edit the same thing?",
      answer:
        "The most recent save wins, and everyone's screen refreshes to show it.",
    },
  ],
  relatedFeatureSlugs: ["wishlist-voting", "group-expenses", "google-calendar-sync"],
  relatedArticleSlugs: ["how-to-plan-a-group-holiday", "wanderlog-vs-triptrack"],
};
