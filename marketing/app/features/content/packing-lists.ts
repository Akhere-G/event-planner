import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const packingListsFeature: FeaturePage = {
  slug: "packing-lists",
  name: "Packing lists",
  title: "Shared and personal packing lists for group trips",
  description:
    "Keep your own packing list private and share group gear, like the speaker or the sash, so the group doesn't bring three of everything.",
  primaryKeyword: "shared packing list app",
  secondaryKeywords: [
    "group trip packing list",
    "hen do packing list",
    "packing checklist for city break",
  ],
  screenshots: [
    featureScreenshot(
      "packing-lists-1",
      "Packing checklist with My Items and Group Gear tabs, a Smart generate button and items grouped by category",
      "Personal items and group gear in separate tabs, grouped by category with a packed count.",
    ),
  ],
  summary:
    "Packing lists split into My Items, which only you see, and Group Gear, which the whole trip shares. Add items by category, tick them off as you pack, or let Smart generate suggest a list.",
  steps: [
    {
      title: "Add items",
      body: "Give each item a name and a category, and choose whether it's yours or shared with the group.",
    },
    {
      title: "Generate a starting list",
      body: "Smart generate suggests packing items for the trip. They arrive as a proposal for you to approve.",
    },
    {
      title: "Tick things off",
      body: "Check items as they go in the bag and watch the packed count rise.",
    },
  ],
  benefits: [
    "Group gear stops the classic three-hairdryers, zero-adaptors problem.",
    "Personal items stay private to you.",
    "Categories make long lists easier to scan.",
  ],
  limits: [
    "Generated suggestions are general. Check airline baggage rules and the weather yourself.",
    "Changing shared group gear depends on your role in the trip.",
  ],
  faqs: [
    {
      question: "Can other people see my packing list?",
      answer:
        "No. Items in My Items are only visible to you. Items in Group Gear are shared with the trip.",
    },
    {
      question: "Can TripTrack suggest what to pack?",
      answer:
        "Yes. Smart generate creates suggestions as a proposal, and you choose which to add.",
    },
  ],
  relatedFeatureSlugs: ["ai-proposals", "collaboration-roles", "trip-templates-export"],
  relatedArticleSlugs: ["travel-planning-checklist"],
};
