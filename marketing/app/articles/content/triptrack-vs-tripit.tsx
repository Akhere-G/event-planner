import { newYorkGuide } from "../../destinations/guides/new-york";
import {
  AppLink,
  ArticleSection,
  CheckList,
  ComparisonTable,
  DecisionBox,
  ProductScreenshot,
  Subheading,
  TripTrackCta,
} from "../components/ArticleElements";
import type { TravelArticle } from "../types";

function Content() {
  return (
    <>
      <p>
        TripTrack and TripIt overlap, but they begin at opposite ends of the travel
        workflow. TripTrack helps a group build the plan: choose places, arrange days,
        map routes and agree changes. TripIt excels after bookings exist: forward the
        confirmations and it assembles the operational itinerary.
      </p>

      <DecisionBox>
        <p><strong>Choose TripTrack</strong> when planning activities and coordinating the group are the hard parts.</p>
        <p><strong>Choose TripIt</strong> when collecting reservations, accessing them offline and staying ahead of flight changes are the hard parts.</p>
        <p>Some frequent travellers could reasonably plan in one and keep booking-day information in the other.</p>
      </DecisionBox>

      <ArticleSection id="table" title="TripTrack vs TripIt at a glance">
        <ComparisonTable
          firstLabel="TripTrack"
          secondLabel="TripIt"
          rows={[
            { criterion: "Primary job", first: "Build and collaboratively edit a day-by-day trip", second: "Organise reservations into one itinerary" },
            { criterion: "Itinerary input", first: "Manual planning, templates and AI generation/editing", second: "Confirmation email forwarding, inbox sync and manual plans" },
            { criterion: "Maps", first: "Google place search, day pins, routes and travel modes", second: "Mobile map view, maps and directions attached to plans" },
            { criterion: "Flights", first: "Search and save flights; no verified real-time disruption alerts", second: "Reservation organisation; Pro adds real-time alerts, alternate flights and baggage info" },
            { criterion: "Calendar", first: "Two-way Google Calendar sync and .ics export", second: "Read-only calendar feed and one-time calendar export" },
            { criterion: "Collaboration", first: "Admin, Editor and Viewer roles with live trip updates", second: "View, edit and edit-and-travelling permissions" },
            { criterion: "Offline", first: "No native offline mode verified", second: "Itineraries available offline in the mobile app" },
            { criterion: "Pricing", first: "No public pricing or tier page found", second: "Free tier; Pro US$49/year" },
          ]}
        />
      </ArticleSection>

      <ProductScreenshot
        src="/flights.png"
        alt="TripTrack flight search results beside an itinerary"
        width={1702}
        height={935}
        caption="TripTrack searches for flights to add to the plan; it is not presented here as a real-time disruption-alert service."
      />

      <ArticleSection id="workflow" title="Planning first or bookings first?">
        <Subheading>TripTrack starts with the shape of the day</Subheading>
        <p>
          In TripTrack, travellers can create a trip manually, clone a destination
          template or describe the trip to the AI generator. Activities and places
          can then be arranged by date and time, viewed on the calendar and checked
          against the map. It is designed for the period when the group is still
          deciding what should happen.
        </p>
        <Subheading>TripIt starts with confirmed travel</Subheading>
        <p>
          TripIt&apos;s defining workflow is forwarding confirmation emails to a dedicated
          address. It recognises flights, lodging, cars and other plans and creates the
          itinerary. Manual additions remain possible, but automatic booking
          organisation is the reason to choose it over a spreadsheet.
        </p>
      </ArticleSection>

      <ArticleSection id="flights" title="Flights: search versus operational alerts">
        <p>
          TripTrack can search by route or flight number, save the selected journey,
          keep its times beside the itinerary and associate a flight cost with trip
          expenses. That helps planning around arrival and departure.
        </p>
        <p>
          TripIt Pro goes further on the day of travel. Its official pricing page
          lists real-time flight alerts, check-in and terminal reminders, alternate
          flights, connecting-gate guidance and baggage-claim information. If those
          alerts are the deciding feature, TripIt Pro is the stronger choice.
        </p>
      </ArticleSection>

      <ArticleSection id="calendar" title="Calendar support is not the same in both products">
        <p>
          TripTrack implements a Google Calendar account connection and per-trip
          synchronisation. Calendar webhooks allow changes to flow back to the trip,
          making this a two-way workflow. Other calendar apps can receive an exported
          .ics file.
        </p>
        <p>
          TripIt provides a calendar feed that can be subscribed to in Google,
          Apple and other calendar applications. TripIt&apos;s help centre explicitly
          describes that feed as read-only and notes that refresh time can range from
          15 minutes to 24 hours. It also offers a one-time trip export.
        </p>
      </ArticleSection>

      <ProductScreenshot
        src="/budget.png"
        alt="TripTrack shared budget with trip costs and balances"
        width={1760}
        height={948}
        caption="TripTrack keeps shared costs and balances inside the same group trip."
      />

      <ArticleSection id="groups" title="Collaboration and group costs">
        <p>
          Both tools support more than passive sharing. TripIt lets an owner grant
          view, edit or edit-and-travelling permissions. TripTrack uses Admin, Editor
          and Viewer roles and broadcasts changes to the group in real time.
        </p>
        <p>
          TripTrack adds a group-expense workflow with payers, split types, balances
          and settlements. TripIt stores reservation costs and hides sensitive values
          from some viewers, but it is not positioned as a split-bill ledger. For a
          holiday with friends, that difference may matter more than flight alerts.
        </p>
      </ArticleSection>

      <ArticleSection id="ai" title="AI and discovery">
        <p>
          TripTrack can generate an itinerary, suggest ways to fill empty time and
          propose edits from a natural-language request. Proposed changes wait for a
          person to approve them. Google-powered place search brings restaurants,
          museums and attractions into the map.
        </p>
        <p>
          TripIt is not primarily an AI day planner. In 2026 it added Apple
          Intelligence features for Pro users on supported Apple devices, including
          turning images, PDFs and unfiled items into plans. That is an import aid,
          not a substitute for TripTrack&apos;s activity-planning workflow.
        </p>
      </ArticleSection>

      <ArticleSection id="price" title="Pricing and limitations">
        <p>
          TripIt publishes a free plan and a US$49-per-year Pro plan. The free plan
          covers itinerary organisation, sharing, calendar feeds, maps and a small
          document allowance. Pro is mainly justified by flight-day intelligence and
          larger document limits.
        </p>
        <p>
          TripTrack&apos;s public site did not publish a price or formal plan limits when
          checked. The implementation supports creating an anonymous trip before
          saving it to an account, but that does not prove a permanent free tier.
          TripTrack also lacks a verified native offline experience, while TripIt
          explicitly supports offline itinerary access in its mobile apps.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Verdict">
        <CheckList>
          <li><strong>TripTrack suits:</strong> leisure groups building a shared schedule, map and budget from scratch.</li>
          <li><strong>TripIt suits:</strong> frequent or business travellers who already have bookings and value operational flight information.</li>
          <li><strong>Use both only if the hand-off is clear:</strong> decide which product is the source of truth for times and changes.</li>
        </CheckList>
        <p>
          TripIt is the more established reservation organiser. TripTrack is the more
          planning-oriented workspace. The right answer depends on whether your trip
          is still being designed or already needs to run smoothly.
        </p>
      </ArticleSection>

      <TripTrackCta title="Build the plan before the confirmations arrive">
        Use <AppLink>TripTrack</AppLink> to arrange activities, routes and shared
        costs, then decide which bookings need a dedicated operational organiser.
      </TripTrackCta>
    </>
  );
}

export const triptrackVsTripitArticle: TravelArticle = {
  slug: "triptrack-vs-tripit",
  categorySlug: "product-comparisons",
  categoryLabel: "Travel planner comparisons",
  title: "TripTrack vs TripIt: Planning App or Booking Organiser?",
  description:
    "Compare TripTrack and TripIt across itinerary planning, reservation imports, maps, flight tools, calendar sync, collaboration, pricing and offline access.",
  excerpt:
    "TripTrack helps groups build the day plan; TripIt turns confirmations into an operational itinerary.",
  primaryKeyword: "TripTrack vs TripIt",
  secondaryKeywords: ["TripIt alternative", "TripIt comparison", "travel itinerary organiser"],
  searchIntent: "Compare TripTrack and TripIt before choosing an itinerary tool",
  image: newYorkGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 11,
  relatedGuideSlugs: ["new-york-travel-guide"],
  sources: [
    { title: "TripTrack product features", url: "https://triptrack.uk/" },
    { title: "TripIt free and Pro pricing", url: "https://www.tripit.com/web/pro/pricing" },
    { title: "TripIt calendar feed setup and limitations", url: "https://help.tripit.com/en/support/solutions/articles/103000063280-calendar-feed-setup-and-sync" },
    { title: "TripIt trip sharing permissions", url: "https://help.tripit.com/en/support/solutions/articles/103000063367-trip-sharing-in-the-tripit-website" },
    { title: "TripIt map view", url: "https://help.tripit.com/en/support/solutions/articles/103000063298-map-view" },
    { title: "TripIt Apple Intelligence plan imports", url: "https://help.tripit.com/en/support/solutions/articles/103000361047" },
    { title: "TripIt App Store listing and ratings", url: "https://apps.apple.com/us/app/tripit-travel-planner/id311035142" },
  ],
  Content,
};
