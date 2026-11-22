import { newYorkGuide } from "../../destinations/guides/new-york";
import {
  ArticleLink,
  ArticleSection,
  CheckList,
  DecisionBox,
  GuideLink,
  Subheading,
  TripTrackCta,
} from "../components/ArticleElements";
import { ArticlePhoto } from "../components/ArticlePhoto";
import { articlePhotos } from "../photos";
import type { TravelArticle } from "../types";

function Content() {
  return (
    <>
      <p>
        Some trips are planned around a place. The best group trips are often
        planned around a moment: a festival, a final, a total eclipse. 2027 is
        packed with them, and several need booking far earlier than a normal
        holiday. Here are the events worth building a group trip around, and
        when to start planning.
      </p>

      <DecisionBox>
        <p>
          Book early for Glastonbury and the 2 August solar eclipse. Plan in the
          spring for the World Cups and the Tour de France in Edinburgh.
          Eurovision in Burgas and the summer festivals can wait a little
          longer.
        </p>
      </DecisionBox>

      <ArticleSection id="music" title="Music and culture">
        <Subheading>Eurovision, Burgas, 11 to 15 May</Subheading>
        <p>
          Bulgaria hosts the 71st Eurovision Song Contest at Arena Burgas on the
          Black Sea coast, with live shows on 11, 13 and 15 May. Read our{" "}
          <ArticleLink slug="eurovision-2027-burgas-group-trip">
            Eurovision 2027 group trip guide
          </ArticleLink>
          .
        </p>
        <Subheading>Glastonbury, 23 to 27 June</Subheading>
        <p>
          The festival returns after its 2026 fallow year. Tickets need advance
          registration and sell out fast.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.festivalCrowd}
        caption="Festival tickets go fast. Agree as a group who will try for tickets and how you will pay each other back."
      />

      <ArticleSection id="sport" title="Sport">
        <Subheading>FIFA Women’s World Cup, Brazil, June to July</Subheading>
        <p>
          The first Women’s World Cup in South America, with matches across
          Brazil.
        </p>
        <Subheading>Tour de France Grand Départ, Edinburgh, July</Subheading>
        <p>
          The Tour starts in Scotland for the first time, with early stages
          crossing Scotland, England and Wales. Roadside viewing is free, but
          Edinburgh beds will be in demand.
        </p>
        <Subheading>The Open, St Andrews, July</Subheading>
        <p>Golf’s oldest major returns to the Old Course.</p>
        <Subheading>Ryder Cup, Adare Manor, Ireland, September</Subheading>
        <p>Europe versus the USA in County Limerick.</p>
        <Subheading>Rugby World Cup, Australia, October to November</Subheading>
        <p>
          The first 24-team tournament, across Australian cities, overlapping with
          the Cricket World Cup in South Africa, Zimbabwe and Namibia.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.edinburghRoyalMile}
        caption="Edinburgh’s Royal Mile. The city hosts the Tour de France Grand Départ in July 2027."
      />

      <ArticleSection id="eclipse" title="The total solar eclipse, 2 August">
        <p>
          One of the longest total eclipses visible from land this century crosses
          southern Spain, Gibraltar, North Africa and Egypt, with more than six
          minutes of totality near Luxor. Read our{" "}
          <ArticleLink slug="solar-eclipse-2027-luxor-or-spain">
            guide to choosing between Luxor and southern Spain
          </ArticleLink>
          .
        </p>
      </ArticleSection>

      <ArticleSection id="planning" title="Planning a trip around an event">
        <CheckList>
          <li>Check official ticket and registration dates before booking flights.</li>
          <li>Book accommodation as soon as dates are confirmed: host cities fill up.</li>
          <li>Choose refundable rooms if tickets are not yet guaranteed.</li>
          <li>Add a few days around the event to see the place itself.</li>
        </CheckList>
        <p>
          Many of our destinations work well around these dates. Combine
          Eurovision with a Black Sea beach week, or the Tour de France with a
          Scottish road trip. For city ideas, start with the{" "}
          <GuideLink slug="new-york-travel-guide">New York travel guide</GuideLink>{" "}
          or our other destination guides.
        </p>
      </ArticleSection>

      <TripTrackCta title="Put the dates in everyone’s calendar">
        Add the event to a shared trip, sync it to Google Calendar and build the
        days around it together.
      </TripTrackCta>
    </>
  );
}

export const eventsWorthPlanningATripAround2027Article: TravelArticle = {
  slug: "events-worth-planning-a-trip-around-2027",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "2027 Events Worth Planning a Group Trip Around",
  description:
    "The biggest events of 2027 to plan a group trip around: Eurovision in Burgas, Glastonbury, the solar eclipse, the World Cups and the Tour de France in Edinburgh.",
  excerpt:
    "Eurovision, Glastonbury, a total eclipse and three World Cups: the 2027 calendar for groups who like a big occasion.",
  primaryKeyword: "events 2027 travel",
  secondaryKeywords: ["things to do in 2027", "2027 events worth travelling for", "group trip ideas 2027"],
  searchIntent: "Find major 2027 events to plan a trip around",
  image: newYorkGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["new-york-travel-guide"],
  sources: [
    { title: "Eurovision: Burgas to host the 71st Eurovision Song Contest", url: "https://www.eurovision.com/stories/burgas-to-host-71st-eurovision-bulgaria-2027/" },
    { title: "Glastonbury Festivals", url: "https://www.glastonburyfestivals.co.uk/" },
    { title: "Rugby World Cup 2027", url: "https://www.rugbyworldcup.com/2027" },
    { title: "Tripmojo: upcoming events in 2027", url: "https://tripmojo.ai/blog/upcoming-events-in-2027-worth-planning-a-trip-around" },
  ],
  Content,
};
