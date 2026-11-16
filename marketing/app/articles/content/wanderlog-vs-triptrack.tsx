import { amsterdamGuide } from "../../destinations/guides/amsterdam";
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
        Wanderlog and TripTrack both turn places into a shared itinerary, but they
        are at different stages and make different trade-offs. Wanderlog is an
        established web and mobile product with a documented free tier and paid
        offline tools. TripTrack is a browser planner centred on a combined calendar
        and map, approval-based AI changes and two-way Google Calendar sync.
      </p>

      <DecisionBox>
        <p>
          <strong>Wanderlog is the safer general recommendation</strong> if you want
          native mobile apps, offline access, automatic Gmail scanning or a clearly
          documented free plan.
        </p>
        <p>
          <strong>TripTrack is the more interesting fit</strong> if your group wants
          live roles, a calendar-and-map workspace, shared expenses and AI suggestions
          that must be reviewed before they change the trip.
        </p>
      </DecisionBox>

      <ArticleSection id="table" title="Wanderlog vs TripTrack at a glance">
        <ComparisonTable
          firstLabel="TripTrack"
          secondLabel="Wanderlog"
          rows={[
            { criterion: "Day-by-day itinerary", first: "Calendar and list views with timed activities", second: "Daily itinerary with times, lists and a compact view" },
            { criterion: "Maps and places", first: "Google place search, pins, routes and travel modes", second: "Itinerary and map together, place discovery and directions" },
            { criterion: "Flights", first: "Search by route or flight number and save details; no verified disruption alerts", second: "Import reservations; flight deals are listed as Pro" },
            { criterion: "Google Calendar", first: "Implemented two-way trip sync, plus calendar export", second: "No native Google Calendar sync verified in the official product pages reviewed" },
            { criterion: "Collaboration", first: "Live updates with Admin, Editor and Viewer roles", second: "Live collaboration with view or edit permissions" },
            { criterion: "AI planning", first: "Generate and edit trips; review proposals before applying", second: "AI assistance; unlimited use listed under Pro" },
            { criterion: "Budget", first: "Shared expenses, splits, balances and settlements", second: "Budgeting and expense tools in the planning product" },
            { criterion: "Offline and mobile", first: "Browser app; no native offline mode verified", second: "iOS and Android; offline trip plans are a Pro feature" },
            { criterion: "Pricing", first: "No public pricing or tier page found", second: "Free tier; Pro from US$39.99/year or US$16.99/month" },
          ]}
        />
      </ArticleSection>

      <ProductScreenshot
        src="/map.png"
        alt="TripTrack map showing planned activities, routes and an itinerary panel"
        width={1600}
        height={1000}
        caption="TripTrack uses Google place data and routing inside the working itinerary."
      />

      <ArticleSection id="planning" title="Which is better for building an itinerary?">
        <p>
          Wanderlog is more flexible at the research stage. You can collect places in
          lists, bring them into individual days, see the plan on a map and import
          reservation details. Its official free tier permits unlimited places and
          live collaboration, which makes it easy to test with a full trip.
        </p>
        <p>
          TripTrack feels more like a shared schedule. Activities sit in day and
          calendar views, route legs are visible on the map and the same trip can hold
          accommodation, flights, packing items and expenses. That structure suits a
          group moving from ideas to a committed plan, but it may feel heavier if all
          you want is a loose list of restaurants.
        </p>
      </ArticleSection>

      <ArticleSection id="ai" title="AI planning: assistance versus controlled changes">
        <p>
          Both products advertise AI assistance. Wanderlog includes smart
          recommendations in the free plan and lists unlimited AI assistance under
          Pro. TripTrack can generate a trip from a prompt, fill open time and propose
          natural-language edits.
        </p>
        <p>
          TripTrack&apos;s distinctive choice is the approval step: a proposed change is
          previewed before it alters the itinerary. That is valuable when “move
          dinner” would otherwise create a clash or delete something another person
          added. AI suggestions still need checking for opening times, travel time and
          availability in either product.
        </p>
      </ArticleSection>

      <ArticleSection id="collaboration" title="Group travel and permissions">
        <p>
          Wanderlog lets travellers invite friends and choose whether they can view or
          edit. TripTrack uses three named roles—Admin, Editor and Viewer—and pushes
          trip updates to connected users in real time. Both can replace a chain of
          conflicting itinerary files.
        </p>
        <p>
          TripTrack also keeps shared expenses beside the itinerary, including who
          paid, how a cost is split and the remaining balances. Wanderlog has its own
          budget and expense tools. Before choosing, create one test expense with the
          exact split your group expects; the details matter more than a tick in a
          feature table.
        </p>
      </ArticleSection>

      <ProductScreenshot
        src="/invites.png"
        alt="TripTrack invitation screen showing Admin, Editor and Viewer access roles"
        width={1904}
        height={1196}
        caption="TripTrack separates administration, editing and view-only access for a shared trip."
      />

      <ArticleSection id="calendar-flights" title="Calendar and flight differences">
        <Subheading>Calendar</Subheading>
        <p>
          TripTrack implements Google Calendar connection and trip-level sync, with
          calendar webhooks bringing changes back into the trip. It can also export an
          .ics file for other calendar applications. We did not find a native Google
          Calendar sync claim in the Wanderlog pricing or help pages reviewed, so this
          comparison does not assume one.
        </p>
        <Subheading>Flights</Subheading>
        <p>
          Wanderlog can import flight and hotel reservations, including email-based
          importing. TripTrack can search flights by route or number, save the chosen
          journey and place the flight beside the relevant itinerary days. TripTrack
          does not currently support the kind of real-time flight-disruption alerts
          that TripIt Pro specialises in, so “flight tracking” would overstate the
          verified implementation.
        </p>
      </ArticleSection>

      <ArticleSection id="price" title="Price and offline access">
        <p>
          Wanderlog publishes the clearer offer: its free tier includes unlimited
          places, collaboration, reservation importing, recommendations and the
          combined itinerary/map view. Pro was listed from US$39.99 per year or
          US$16.99 per month when checked, with offline access, route optimisation,
          Gmail scanning and unlimited AI among the paid features.
        </p>
        <p>
          TripTrack&apos;s public site did not show a pricing table, subscription price or
          formal free-tier limits. The application supports anonymous trip creation
          in the implementation, but that is not the same as a guaranteed free plan.
          Check the product before making cost a deciding factor.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Verdict: who should choose which?">
        <CheckList>
          <li><strong>Choose Wanderlog</strong> for native mobile apps, offline access, a mature free tier and a broad planning workflow.</li>
          <li><strong>Choose TripTrack</strong> for reviewed AI edits, Google Calendar changes in both directions and explicit group roles.</li>
          <li><strong>Choose neither by feature count alone:</strong> build one busy day, invite a friend and test the mobile experience before moving the whole trip.</li>
        </CheckList>
        <p>
          For many travellers, Wanderlog remains the more complete default. TripTrack
          earns consideration when its particular workflow—calendar, map, live roles
          and controlled AI changes—matches the way the group actually makes decisions.
        </p>
      </ArticleSection>

      <TripTrackCta title="Compare with your own itinerary">
        Open <AppLink>TripTrack</AppLink>, add a real day and invite one travel
        companion. A representative test is more useful than another feature list.
      </TripTrackCta>
    </>
  );
}

export const wanderlogVsTriptrackArticle: TravelArticle = {
  slug: "wanderlog-vs-triptrack",
  categorySlug: "product-comparisons",
  categoryLabel: "Travel planner comparisons",
  title: "Wanderlog vs TripTrack: Which Travel Planner Fits Your Trip?",
  description:
    "A balanced Wanderlog vs TripTrack comparison covering itineraries, maps, AI, collaboration, flights, Google Calendar, offline access and pricing.",
  excerpt:
    "Wanderlog is the established all-rounder; TripTrack takes a calendar-first, approval-based approach to shared planning.",
  primaryKeyword: "Wanderlog vs TripTrack",
  secondaryKeywords: ["Wanderlog alternative", "TripTrack travel planner", "Wanderlog comparison"],
  searchIntent: "Compare Wanderlog and TripTrack before choosing a planner",
  image: amsterdamGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 11,
  relatedGuideSlugs: ["amsterdam-travel-guide"],
  sources: [
    { title: "TripTrack product features", url: "https://triptrack.uk/" },
    { title: "Wanderlog free and Pro feature comparison", url: "https://wanderlog.com/pro" },
    { title: "Wanderlog help: add friends and set permissions", url: "https://help.wanderlog.com/hc/en-us/articles/4625495771163-Add-friends-to-plan-together" },
    { title: "Wanderlog help: itinerary and map features", url: "https://help.wanderlog.com/hc/en-us" },
    { title: "Wanderlog help: mobile and offline access", url: "https://help.wanderlog.com/hc/en-us/articles/13356415853467-Download-the-app" },
    { title: "Wanderlog App Store ratings and reviews", url: "https://apps.apple.com/us/app/wanderlog-travel-planner/id1476732439?see-all=reviews" },
  ],
  Content,
};
