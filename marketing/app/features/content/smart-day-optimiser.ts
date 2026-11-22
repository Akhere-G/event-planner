import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const smartDayOptimiserFeature: FeaturePage = {
  slug: "smart-day-optimiser",
  name: "Smart day optimiser",
  title: "Optimise your itinerary: less zigzagging, better days",
  description:
    "Choose the days to improve and what matters, such as less travel, staying in one neighbourhood or opening hours. Review the suggested changes before anything moves.",
  primaryKeyword: "itinerary optimiser",
  secondaryKeywords: [
    "optimise travel itinerary",
    "reorder day trip stops",
    "itinerary route planner",
  ],
  screenshots: [
    featureScreenshot(
      "smart-day-optimiser-1",
      "Optimise your days dialog with day picker and goals: minimise travel, group by neighbourhood, respect opening hours",
      "Pick one or more days and tell the optimiser what a better day looks like.",
    ),
    featureScreenshot(
      "smart-day-optimiser-2",
      "Optimiser options for pace, day start and end time, and events locked in place",
      "Set the pace and time window, and lock the bookings that must not move.",
    ),
  ],
  summary:
    "The smart day optimiser reworks the days you choose around your goals. It can cut travel between stops, keep nearby places together and plan around opening hours, then shows you the proposed changes to approve.",
  steps: [
    {
      title: "Choose the days",
      body: "Select one day or the whole trip from the day menu.",
    },
    {
      title: "Set your goals",
      body: "Pick any of minimise travel, group by neighbourhood and respect opening hours.",
    },
    {
      title: "Add your rules",
      body: "Optionally set a pace, when the day starts and ends, events to keep exactly as they are, whether stops can be added or removed, and a short note of up to 500 characters.",
    },
    {
      title: "Review and apply",
      body: "The optimiser runs in the background. When it's ready, review each change and apply only the ones you want.",
    },
  ],
  benefits: [
    "Untangles a day that crosses the city three times, which matters when eight people are moving together.",
    "Locked events stay put, so the restaurant booking or boat party you've paid for isn't touched.",
    "Suggestions that clash with your flights, fall outside your day window or overlap each other are rejected before you see them.",
    "Nothing changes until you approve it.",
  ],
  limits: [
    "Suggestions come from an AI model working from the information it's given. It's assisted planning, not a guaranteed shortest route.",
    "Opening hours from Google can be included, but a venue being open isn't guaranteed. Check before you go.",
    "Results take a little while because the work runs in the background.",
  ],
  faqs: [
    {
      question: "Will the optimiser move my booked dinner?",
      answer:
        "Not if you lock it. Locked events are left out of the set the optimiser can change.",
    },
    {
      question: "Does it change my itinerary straight away?",
      answer:
        "No. It creates a proposal. You review each suggested change and nothing is saved until you apply it.",
    },
    {
      question: "Can it add new places?",
      answer:
        "Only if you allow additions and removals in the options. Otherwise it works with the events already on the day.",
    },
  ],
  relatedFeatureSlugs: ["ai-proposals", "fill-in-my-day", "directions"],
  relatedArticleSlugs: ["how-to-create-travel-itinerary", "wanderlog-vs-triptrack"],
};
