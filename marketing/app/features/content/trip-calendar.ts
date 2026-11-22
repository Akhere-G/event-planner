import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const tripCalendarFeature: FeaturePage = {
  slug: "trip-calendar",
  name: "In-app trip calendar",
  title: "See your whole trip in a month, week or day calendar",
  description:
    "Switch your itinerary from a list to a calendar and see events and flights by month, week or day, next to the trip map.",
  primaryKeyword: "trip itinerary calendar",
  secondaryKeywords: [
    "travel itinerary calendar view",
    "week view trip planner",
    "holiday planner calendar",
  ],
  screenshots: [
    featureScreenshot(
      "trip-calendar-1",
      "Month calendar for March 2027 with a week of Lisbon events and a return flight on the last day",
      "Month view shows the shape of the whole trip at a glance.",
    ),
    featureScreenshot(
      "trip-calendar-2",
      "Week calendar for 22 to 28 March 2027 with each day's events laid out by time",
      "Week view lays every day out by the hour, so gaps and clashes are obvious.",
    ),
  ],
  summary:
    "The trip calendar is another way to look at the same itinerary. Toggle from List to Calendar and switch between month, week and day views. Flights appear alongside events.",
  steps: [
    {
      title: "Switch to Calendar",
      body: "On the Activities tab, change the view from List to Calendar.",
    },
    {
      title: "Choose month, week or day",
      body: "Use month to see the whole trip, week to compare days by the hour, or day to focus.",
    },
    {
      title: "Jump to a day",
      body: "Select a date to see its events, with the map alongside.",
    },
  ],
  benefits: [
    "Spot the empty Saturday afternoon or the double-booked Friday night at a glance.",
    "Flights sit in the calendar too, so travel days look as full as they are.",
    "Everyone in the group sees the same calendar, which updates when someone changes the plan.",
  ],
  limits: [
    "The in-app calendar shows events and flights. Accommodation stays on its own tab.",
    "To see the trip in another calendar app, use Google Calendar sync or the .ics export.",
  ],
  faqs: [
    {
      question: "Is there a week view?",
      answer:
        "Yes. The calendar has month, week and day views.",
    },
    {
      question: "Can I put the trip in my phone's calendar?",
      answer:
        "Yes. Sync it with Google Calendar, or export an .ics file and import it into another calendar app.",
    },
  ],
  relatedFeatureSlugs: ["google-calendar-sync", "trip-templates-export", "flight-search"],
  relatedArticleSlugs: ["triptrack-vs-tripit", "how-to-create-travel-itinerary"],
};
