import { bangkokGuide } from "../../destinations/guides/bangkok";
import {
  AppLink,
  ArticleSection,
  CheckList,
  GuideLink,
  ItineraryLink,
  Subheading,
  TripTrackCta,
} from "../components/ArticleElements";
import type { TravelArticle } from "../types";
import { ArticlePhoto } from "../components/ArticlePhoto";
import { articlePhotos } from "../photos";

function Content() {
  return (
    <>
      <p>
        A travel planning checklist should prevent expensive mistakes without turning
        the holiday into a project. Use this one in order: decisions that affect the
        entire trip come first; details that can wait stay later.
      </p>
      <p>
        Entry rules, health guidance and transport disruption can change. Treat this
        as an organising framework and verify official advice for your passport,
        destination and travel dates.
      </p>

      <ArticleSection id="before-booking" title="Before you book">
        <CheckList>
          <li>Agree the dates, trip length and a total budget range.</li>
          <li>Check passport validity and official entry requirements.</li>
          <li>Read current government travel advice for every destination.</li>
          <li>Check the likely weather, public holidays and major events.</li>
          <li>Compare flight times as well as prices; a poor arrival can remove a day.</li>
          <li>Decide whether the trip needs checked baggage, transfers or a car.</li>
          <li>Check travel insurance terms before relying on cancellation cover.</li>
        </CheckList>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.passportLuggage}
        caption="Check the entry requirements for the passport you will travel on before committing to bookings."
      />

      <ArticleSection id="after-booking" title="As soon as transport is booked">
        <CheckList>
          <li>Save booking references and passenger names exactly as issued.</li>
          <li>Add local arrival and departure times to a shared itinerary.</li>
          <li>Research the airport or station transfer, including late arrivals.</li>
          <li>Choose accommodation by neighbourhood and transport, not photos alone.</li>
          <li>Check check-in hours, luggage storage and cancellation dates.</li>
          <li>Add reminders for any balance payments or check-in windows.</li>
        </CheckList>
        <p>
          For a large city such as Bangkok, location changes the trip. The
          <GuideLink slug="bangkok-travel-guide">Bangkok travel guide</GuideLink>
          {" explains the trade-offs between riverside areas, the Old Town and modern transport corridors, while the "}
          <ItineraryLink slug={bangkokGuide.templateSlug}>four-day Bangkok itinerary</ItineraryLink>
          {" demonstrates how to group them."}
        </p>
      </ArticleSection>

      <ArticleSection id="six-weeks" title="Four to six weeks before departure">
        <CheckList>
          <li>List each traveller’s must-do places and resolve clashes.</li>
          <li>Book limited-capacity attractions, tours and essential restaurants.</li>
          <li>Arrange visas or authorisations using official channels.</li>
          <li>Review official health guidance and allow time for appointments.</li>
          <li>Plan how you will pay and tell your bank if it requires travel notice.</li>
          <li>Check phone roaming, eSIM or local SIM options.</li>
          <li>Plan medication and carry supporting documents where required.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="itinerary" title="Build the itinerary">
        <p>
          Put fixed bookings in first, then group saved places by neighbourhood. Give
          each full day one or two anchors and leave room for meals, queues and
          transport. Keep an indoor alternative for weather and mark the easiest item
          to drop.
        </p>
        <p>
          Store the working plan in one place. <AppLink>TripTrack</AppLink> can hold
          saved places, day-by-day activities, mapped routes, flights and a shared
          version for the group. If you use a different tool, apply the same rule:
          one current itinerary, not several competing message threads.
        </p>
      </ArticleSection>

      <ArticleSection id="week-before" title="One week before departure">
        <CheckList>
          <li>Recheck flight or train times and terminal information.</li>
          <li>Confirm accommodation and time-sensitive reservations.</li>
          <li>Download offline maps, tickets and essential confirmations.</li>
          <li>Check the detailed forecast and adjust the packing list.</li>
          <li>Confirm baggage size and weight allowances.</li>
          <li>Share emergency contacts and accommodation details.</li>
          <li>Arrange care for your home, pets and any regular deliveries.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="packing" title="Packing essentials">
        <Subheading>Documents and money</Subheading>
        <CheckList>
          <li>Passport, visas or authorisations, insurance details and tickets.</li>
          <li>At least two usable payment methods stored separately.</li>
          <li>Digital copies of essential documents in secure storage.</li>
        </CheckList>
        <Subheading>Health and practical items</Subheading>
        <CheckList>
          <li>Regular medication in suitable packaging.</li>
          <li>Destination-appropriate clothing and comfortable walking shoes.</li>
          <li>Chargers, plug adaptor and a compliant power bank.</li>
          <li>A small day bag and a reusable water bottle where practical.</li>
        </CheckList>
        <p>
          Pack from planned activities rather than imagined emergencies. If an item
          is inexpensive and easy to buy locally, it rarely deserves much luggage
          space.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.airportBoard}
        caption="Keep flight times and terminal details with your itinerary, then recheck them before departure."
      />

      <ArticleSection id="day-before" title="The day before you leave">
        <CheckList>
          <li>Check in when available and save boarding passes offline.</li>
          <li>Charge devices and download entertainment.</li>
          <li>Check the route to the airport or station for disruption.</li>
          <li>Set the correct alarm and agree the departure time.</li>
          <li>Put documents, medication and valuables in hand luggage.</li>
          <li>Leave the first day light enough to absorb delays.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="group-trips" title="Extra checks for a group holiday">
        <CheckList>
          <li>Name one owner for each booking, not one owner for the entire trip.</li>
          <li>Record who paid and when shared balances are due.</li>
          <li>Agree which activities are optional before money is committed.</li>
          <li>Give everyone access to the itinerary and confirmations they need.</li>
          <li>Keep some independent time in the schedule.</li>
        </CheckList>
      </ArticleSection>

      <TripTrackCta title="Keep the checklist attached to the trip">
        Build the itinerary, store flight details, map saved places, sync activities
        with Google Calendar and share the latest version with everyone travelling.
      </TripTrackCta>
    </>
  );
}

export const travelPlanningChecklistArticle: TravelArticle = {
  slug: "travel-planning-checklist",
  categorySlug: "travel-planning",
  categoryLabel: "Travel planning",
  title: "Travel Planning Checklist: Everything to Do Before You Go",
  description:
    "A practical holiday planning checklist covering documents, bookings, itinerary, money, health, packing and final departure checks in the right order.",
  excerpt:
    "An ordered, practical checklist from the first booking decision to the morning you leave.",
  primaryKeyword: "travel planning checklist",
  secondaryKeywords: ["holiday planning checklist", "trip planning checklist"],
  searchIntent: "Help travellers prepare for a holiday without missing key tasks",
  image: bangkokGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 8,
  relatedGuideSlugs: ["bangkok-travel-guide"],
  sources: [
    { title: "UK government: foreign travel checklist", url: "https://www.gov.uk/guidance/foreign-travel-checklist" },
    { title: "UK government: foreign travel advice", url: "https://www.gov.uk/foreign-travel-advice" },
    { title: "NHS Fit for Travel", url: "https://www.fitfortravel.nhs.uk/home" },
  ],
  Content,
};
