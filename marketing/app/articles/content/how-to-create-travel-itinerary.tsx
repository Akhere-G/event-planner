import { barcelonaGuide } from "../../destinations/guides/barcelona";
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

function Content() {
  return (
    <>
      <p>
        A useful travel itinerary is not a minute-by-minute timetable. It is a small
        set of decisions that keep the trip moving: where you will be each day, which
        bookings are fixed, what is close together and what can be dropped when plans
        change.
      </p>
      <p>
        The best method starts broad and becomes specific only where it needs to.
        Follow these steps and you will finish with a plan that is practical on a map,
        clear to everyone travelling and flexible enough to survive real life.
      </p>

      <ArticleSection id="constraints" title="1. Start with the fixed constraints">
        <p>
          Put the immovable details in first: arrival and departure times,
          accommodation check-in, tickets with timed entry, restaurant reservations,
          performances and any day when a place is closed. Include travel time from
          the airport or station rather than treating arrival time as the moment your
          holiday begins.
        </p>
        <CheckList>
          <li>Write dates and local arrival times at the top of the plan.</li>
          <li>Add confirmation details for transport and accommodation.</li>
          <li>Mark anything prepaid or difficult to move.</li>
          <li>Note the final reasonable departure time for the airport or station.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="priorities" title="2. Choose priorities before making days">
        <p>
          Ask each traveller for three must-do places, then combine the answers. This
          reveals conflicts while they are still easy to solve. A list of 40 saved
          places is research, not an itinerary; the priorities are the few places the
          trip would feel incomplete without.
        </p>
        <p>
          Keep a second list for “good if nearby”. That list supplies cafés, parks and
          alternatives without forcing them into the schedule.
        </p>
      </ArticleSection>

      <ArticleSection id="map" title="3. Put every candidate on a map">
        <p>
          Geography is the difference between a plausible itinerary and an exhausting
          one. Add the accommodation, priority sights, restaurants and stations to a
          map. Natural clusters will appear. Those clusters—not categories such as
          “museums” or “food”—should become the basis of each day.
        </p>
        <p>
          In Barcelona, for example, the Gothic Quarter and El Born pair naturally,
          while Park Güell and Gràcia make a more sensible second cluster. The
          <GuideLink slug="barcelona-travel-guide">Barcelona travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={barcelonaGuide.templateSlug}>four-day Barcelona itinerary</ItineraryLink>
          {" show how that grouping works in practice."}
        </p>
      </ArticleSection>

      <ArticleSection id="anchors" title="4. Give each day one or two anchors">
        <p>
          An anchor is the booking or experience that determines the shape of a day:
          a major museum at 10:00, a food tour at 15:00 or a restaurant across town at
          19:30. One or two anchors are enough. Everything else should fit around them
          geographically and leave a realistic margin.
        </p>
        <Subheading>A simple day structure</Subheading>
        <CheckList>
          <li>Morning anchor while energy and queues are favourable.</li>
          <li>Lunch nearby rather than at a restaurant chosen in isolation.</li>
          <li>One flexible afternoon area with two or three options.</li>
          <li>An evening plan that accounts for the journey back.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="time" title="5. Estimate time honestly">
        <p>
          Travel time is more than the number displayed by a routing app. Add time to
          leave a venue, find the platform, wait, walk from the stop and get oriented.
          Add queues and security at major attractions. Add a buffer after flights.
          Three substantial sights can already make a full day.
        </p>
        <p>
          Avoid scheduling every meal at a famous restaurant. A good itinerary needs
          convenient choices as well as destination meals, and it should still work
          if a queue is longer than expected.
        </p>
      </ArticleSection>

      <ArticleSection id="bookings" title="6. Book only what benefits from booking">
        <p>
          Reserve scarce, timed or high-priority experiences. Leave low-risk choices
          flexible. Before paying, check the cancellation terms, exact entrance,
          required identification, accessibility and whether the time shown is local.
          Save the confirmation where every traveller can reach it offline.
        </p>
      </ArticleSection>

      <ArticleSection id="fallbacks" title="7. Add useful fallbacks, not duplicate days">
        <p>
          Each day needs a weather alternative and an easy thing to cut. A museum can
          replace a park in heavy rain; a neighbourhood walk can disappear when a
          long lunch becomes the highlight. Fallbacks should be nearby, not a second
          itinerary hidden underneath the first.
        </p>
      </ArticleSection>

      <ArticleSection id="share" title="8. Put the final plan in one shared place">
        <p>
          The working itinerary should contain dates, locations, booking notes,
          transport and links—not screenshots scattered across a group chat. With
          <AppLink>TripTrack</AppLink>, you can save places, arrange activities by day,
          view routes on a map, track flights, sync activities with Google Calendar
          and share the trip. The tool matters less than the rule: everyone should be
          looking at the same current plan.
        </p>
      </ArticleSection>

      <ArticleSection id="example" title="A compact example">
        <Subheading>Three days in a city</Subheading>
        <CheckList>
          <li><strong>Arrival day:</strong> check in, explore the accommodation area and keep dinner flexible.</li>
          <li><strong>Full day one:</strong> major booked sight, lunch nearby, one connected neighbourhood and an evening reservation.</li>
          <li><strong>Full day two:</strong> second geographic cluster, market or museum, then a flexible final evening.</li>
          <li><strong>Departure day:</strong> one local activity only if luggage and transfer time make it sensible.</li>
        </CheckList>
        <p>
          That may look modest on paper. In practice, it creates time for the streets,
          meals and unplanned stops that make the trip feel like a holiday.
        </p>
      </ArticleSection>

      <TripTrackCta title="Build the itinerary around the map">
        Start with a ready-made destination template or create a trip from scratch,
        then keep places, routes, flights and shared decisions together.
      </TripTrackCta>
    </>
  );
}

export const howToCreateTravelItineraryArticle: TravelArticle = {
  slug: "how-to-create-travel-itinerary",
  categorySlug: "travel-planning",
  categoryLabel: "Travel planning",
  title: "How to Create a Travel Itinerary That Actually Works",
  description:
    "Create a practical travel itinerary step by step: map priorities, group places, handle bookings, estimate travel time and keep the plan flexible.",
  excerpt:
    "A step-by-step method for turning saved places and bookings into a realistic day-by-day trip plan.",
  primaryKeyword: "how to create a travel itinerary",
  searchIntent: "Teach travellers how to build a usable itinerary",
  image: barcelonaGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 9,
  relatedGuideSlugs: ["barcelona-travel-guide"],
  sources: [
    { title: "Think with Google: key UK travel search trends", url: "https://business.google.com/uk/think/consumer-insights/uk-travel-search-trends/" },
    { title: "Google Year in Search 2025: trending travel itineraries", url: "https://trends.withgoogle.com/year-in-search/2025/us/?hl=en-US" },
  ],
  Content,
};
