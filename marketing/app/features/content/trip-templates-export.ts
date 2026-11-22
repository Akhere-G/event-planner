import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const tripTemplatesExportFeature: FeaturePage = {
  slug: "trip-templates-export",
  name: "Trip templates and export",
  title: "Copy a ready-made itinerary, or export yours to Word and .ics",
  description:
    "Start from a published trip template with your own dates, publish your trip as a template, and export the itinerary as a Word document or .ics calendar file.",
  primaryKeyword: "itinerary template",
  secondaryKeywords: [
    "export itinerary to Word",
    "itinerary .ics export",
    "city break itinerary template",
  ],
  screenshots: [
    featureScreenshot(
      "trip-templates-export-1",
      "Publish as template dialog explaining what a template includes and excludes, with title, region and description fields",
      "Publishing explains exactly what's shared: events, accommodation, shared packing and wishlist places, but never members, expenses or flights.",
    ),
    featureScreenshot(
      "google-calendar-sync-1",
      "Trip menu with Export to calendar and Export to Word options",
      "Export the itinerary from the trip menu as an .ics calendar file or a Word document.",
    ),
  ],
  summary:
    "Templates let you start from someone else's plan, and exports let you take yours anywhere. Browse public templates, copy one with your own dates, or publish your trip as a template. Download the itinerary as a Word document or an .ics file.",
  steps: [
    {
      title: "Browse templates",
      body: "Search public templates by destination, filter by region and preview the itinerary. You don't need to sign in to look.",
    },
    {
      title: "Copy one with your dates",
      body: "Choose a start date. Day 2 at 10:00 in the template becomes the second day of your trip at 10:00. The copy is yours to change.",
    },
    {
      title: "Publish your own",
      body: "Trip admins can publish a trip as a template. Dates become relative to the start, and personal details are left out.",
    },
    {
      title: "Export",
      body: "From the trip menu, choose Export to Word for a document of the itinerary, or Export to calendar for an .ics file that includes flights.",
    },
  ],
  benefits: [
    "Start a Kraków stag or Ibiza birthday from a plan that already works, then make it yours.",
    "The Word export is easy to print or send to the one friend who won't download anything.",
    "The .ics file imports into Apple Calendar, Outlook and most other calendar apps.",
  ],
  limits: [
    "Templates exclude members, expenses, payments, flights and personal packing items.",
    "A published template is a snapshot. Republish it to include later changes to your trip.",
    "Copying a template needs a signed-in account.",
    "Exports are one-off files. They don't update when the trip changes.",
    "The .ics file lists trip members, with their names and email addresses, as attendees on each event. Bear that in mind before forwarding it.",
  ],
  faqs: [
    {
      question: "What's included when I publish a template?",
      answer:
        "Events, accommodation, shared packing items and wishlist places, with dates relative to the start. Members, expenses, payments, flights and personal packing items are never included.",
    },
    {
      question: "Will my exported calendar update?",
      answer:
        "No. An .ics export is a copy at that moment. For a calendar that stays up to date, use Google Calendar sync.",
    },
    {
      question: "Can I edit a copied template?",
      answer:
        "Yes. Copying creates a new trip that's independent of the original.",
    },
  ],
  relatedFeatureSlugs: ["google-calendar-sync", "trip-calendar", "ai-trip-generator"],
  relatedArticleSlugs: ["how-to-create-travel-itinerary", "triptrack-vs-tripit"],
};
