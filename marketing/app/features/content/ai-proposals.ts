import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const aiProposalsFeature: FeaturePage = {
  slug: "ai-proposals",
  name: "AI tasks and proposals",
  title: "AI trip suggestions you approve before anything changes",
  description:
    "Every AI suggestion in TripTrack arrives as a proposal. See exactly what will be added, changed or removed, pick the changes you want, and you approve every change.",
  primaryKeyword: "AI trip planner you can control",
  secondaryKeywords: [
    "review AI itinerary changes",
    "edit itinerary with AI",
    "AI travel suggestions approval",
  ],
  screenshots: [
    featureScreenshot(
      "ai-proposals-1",
      "Review proposed changes dialog listing four suggested events with add labels, times and reasons, plus Apply, Reject all and Decide later buttons",
      "Proposals group changes by area. Untick anything you don't want, then apply the rest.",
    ),
    featureScreenshot(
      "ai-proposals-2",
      "Ask AI to edit drawer where the AI points out that a flight lands at 20:35 and asks whether to schedule dinner later",
      "Ask for a change in plain English. Here the AI notices the flight hasn't landed yet and checks first.",
    ),
  ],
  summary:
    "TripTrack's AI tools never edit your trip directly. Fill in my day, the optimiser, the trip generator, packing suggestions and Ask AI to edit all produce a proposal, and you approve every change before it's saved.",
  steps: [
    {
      title: "Ask for help",
      body: "Start an AI task from the day menu, the packing list, the new-trip form, or the Ask AI to edit drawer, where you can type something like “move dinner to 9pm”.",
    },
    {
      title: "Carry on planning",
      body: "Longer tasks run in the background with a progress card. You'll get an in-app notification when suggestions are ready.",
    },
    {
      title: "Review the proposal",
      body: "Suggestions are grouped by area and labelled Add, Change or Remove. Filter them, untick the ones you don't want, or decide later.",
    },
    {
      title: "Apply in one go",
      body: "The selected changes are checked and saved together. If one can't be applied, none of that batch is saved.",
    },
  ],
  benefits: [
    "Shared trips stay trustworthy: nobody wakes up to an itinerary the AI rewrote overnight.",
    "You can take the two good ideas from a suggestion and drop the rest.",
    "If someone edits an item while the AI is working, the proposal flags it for a second look.",
    "Applied changes go through the same permission checks as manual edits, so roles still apply.",
  ],
  limits: [
    "Applying a proposal can overwrite a newer edit to the same fields. The warning flags it but doesn't block it.",
    "Ready proposals expire after seven days.",
    "You can have up to three AI tasks running at once.",
    "Ask AI to edit replies while you wait rather than running in the background.",
    "AI suggestions can be wrong. Check details such as opening times and prices.",
  ],
  faqs: [
    {
      question: "Can the AI change my trip without asking?",
      answer:
        "No. Every AI result is a proposal. You approve every change, and nothing is saved until you apply it.",
    },
    {
      question: "What can I ask the AI to edit?",
      answer:
        "Trip dates and budget, events, accommodation, packing items, wishlists, expenses and recorded payments, depending on your role. Flights are used as context but aren't edited by the AI.",
    },
    {
      question: "What happens if a friend edits the plan while the AI is working?",
      answer:
        "The proposal marks the affected items so you can check them. If an item was deleted, its suggested change is skipped.",
    },
  ],
  relatedFeatureSlugs: ["ai-trip-generator", "fill-in-my-day", "smart-day-optimiser"],
  relatedArticleSlugs: ["best-travel-planning-apps", "wanderlog-vs-triptrack"],
};
