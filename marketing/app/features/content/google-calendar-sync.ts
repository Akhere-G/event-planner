import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const googleCalendarSyncFeature: FeaturePage = {
  slug: "google-calendar-sync",
  name: "Google Calendar sync",
  title: "Sync your trip itinerary with Google Calendar",
  description:
    "Connect Google Calendar and TripTrack creates a separate calendar for each trip, keeping events and flights in step on both sides.",
  primaryKeyword: "sync itinerary with Google Calendar",
  secondaryKeywords: [
    "trip planner Google Calendar",
    "shared trip calendar",
    "itinerary calendar sync",
  ],
  screenshots: [
    featureScreenshot(
      "google-calendar-sync-1",
      "Trip menu showing Export to calendar, Export to Word and Sync to Google Calendar options",
      "Turn on Google Calendar sync for a trip from the trip menu, next to the .ics and Word exports.",
    ),
    featureScreenshot(
      "google-calendar-sync-2",
      "Settings page with a Connect Google Calendar button",
      "Connect your Google account once in Settings, then choose which trips to sync.",
    ),
  ],
  summary:
    "Google Calendar sync puts each trip in its own Google calendar. Event and flight changes made in TripTrack reach your calendar, and admins and editors can make supported changes from Google too.",
  steps: [
    {
      title: "Connect Google Calendar",
      body: "Open Settings and connect your Google account. TripTrack only asks for access to calendars it creates, not your existing ones.",
    },
    {
      title: "Turn on sync for a trip",
      body: "From the trip menu, choose Sync to Google Calendar. TripTrack creates a new calendar for you and that trip.",
    },
    {
      title: "Keep planning",
      body: "New and edited events and flights are pushed to the calendar in the background.",
    },
    {
      title: "Edit from either side",
      body: "Admins and editors can create, move or delete events from Google Calendar and the trip updates. Viewers receive updates but their Google changes don't affect the shared trip.",
    },
  ],
  benefits: [
    "The trip sits next to work and everything else in the calendar people already check.",
    "Each traveller connects their own Google account, so everyone gets the plan without one person forwarding invites.",
    "A separate calendar per trip is easy to hide, colour or delete once you're home.",
    "Moving a saved flight's time in Google reschedules it in the trip.",
  ],
  limits: [
    "Sync covers events and flights. Accommodation, packing, wishlists and expenses stay in TripTrack.",
    "Sync runs in the background, so the two sides can differ for a short time.",
    "When the same item is edited in both places, the most recent edit wins. Changes are not merged field by field.",
    "Deleting a flight's Google entry does not delete the saved flight.",
    "Turning sync off leaves the Google calendar in place for you to keep or delete.",
    "You need a TripTrack account. Trips started without signing in can't be synced.",
  ],
  faqs: [
    {
      question: "Does TripTrack write to my personal Google Calendar?",
      answer:
        "No. It creates a new calendar for each trip you sync and only has access to calendars it created.",
    },
    {
      question: "What happens if two people edit the same event?",
      answer:
        "The most recent edit wins. TripTrack doesn't combine the two versions, so a later change replaces an earlier one.",
    },
    {
      question: "Can I use Apple Calendar or Outlook instead?",
      answer:
        "There is no live sync for them, but you can export the trip as an .ics file and import it into most calendar apps. The export is a one-off copy and won't update.",
    },
  ],
  relatedFeatureSlugs: ["trip-calendar", "trip-templates-export", "collaboration-roles"],
  relatedArticleSlugs: ["triptrack-vs-tripit", "how-to-create-travel-itinerary"],
};
