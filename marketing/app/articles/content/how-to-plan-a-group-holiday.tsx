import { romeGuide } from "../../destinations/guides/rome";
import {
  AppLink,
  ArticleSection,
  CheckList,
  DecisionBox,
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
        Every friendship group has one: the person who ends up organising the
        trip. They collect the deposits, chase the dates, research the
        restaurants and answer the same question in the group chat five times.
        Group holidays go wrong for predictable reasons: unclear budgets,
        decisions made by whoever shouts loudest and money that never quite gets
        paid back. Here is how to avoid all three.
      </p>

      <DecisionBox>
        <p>
          Agree the budget and dates first, let the group vote on the
          destination and the big plans, keep one shared itinerary everyone can
          see, and track shared costs from the very first deposit.
        </p>
      </DecisionBox>

      <ArticleSection id="budget" title="1. Agree the budget before the destination">
        <p>
          Ask everyone for a comfortable total budget privately, then plan around
          the lower end. It is much easier to add an optional splurge than to
          explain to someone that the villa they agreed to is out of reach.
        </p>
      </ArticleSection>

      <ArticleSection id="dates" title="2. Fix the dates early">
        <p>
          Offer two or three date windows and go with the one most people can do.
          Waiting for a date that suits everyone usually means the trip never
          happens.
        </p>
      </ArticleSection>

      <ArticleSection id="vote" title="3. Let everyone vote">
        <p>
          Shortlist two or three destinations, then the big decisions within the
          trip: the restaurants, the day trip, the night out. A vote makes
          everyone feel heard and takes the pressure off the organiser.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.friendsRoadTrip}
        caption="A trip everyone helped shape is a trip everyone actually enjoys."
      />

      <ArticleSection id="plan" title="4. Keep one itinerary, not ten screenshots">
        <p>
          Put flights, accommodation and plans in one place that everyone can
          open, rather than scattered across messages. Plan one or two fixed
          things each day and leave room for people to split off.
        </p>
        <Subheading>Stop the zigzag</Subheading>
        <p>
          Group each day’s plans by area so you are not crossing the city three
          times. An optimiser can suggest a better order, but check it before
          you commit.
        </p>
      </ArticleSection>

      <ArticleSection id="money" title="5. Track money from the first deposit">
        <p>
          Most group-trip arguments are about money. Record every shared cost as
          it happens, split it between the people it applies to (not always
          everyone) and settle up at the end. Agree in advance whether things
          like taxis and rounds are shared or personal.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.friendsDinner}
        caption="Decide before dinner whether you are splitting the bill evenly or by what each person ordered."
      />

      <ArticleSection id="on-the-trip" title="6. On the trip">
        <CheckList>
          <li>Share the day’s plan the night before.</li>
          <li>Pick one meeting point in case phones die.</li>
          <li>Rotate who chooses dinner.</li>
          <li>Build in at least one slow morning.</li>
          <li>Settle up before everyone flies home, while it is fresh.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="tools" title="Tools that help">
        <p>
          A shared trip planner does most of this for you. In{" "}
          <AppLink>TripTrack</AppLink>, the group can vote on wishlist ideas, see
          the same itinerary on a map and calendar, and log shared expenses with
          balances and suggested settle-ups. AI suggestions arrive as proposals
          you approve, so nothing changes without you.
        </p>
      </ArticleSection>

      <TripTrackCta title="Get it out of the group chat">
        Invite the group to one shared trip with the plan, the votes and the
        money in the same place.
      </TripTrackCta>
    </>
  );
}

export const howToPlanAGroupHolidayArticle: TravelArticle = {
  slug: "how-to-plan-a-group-holiday",
  categorySlug: "travel-planning",
  categoryLabel: "Travel planning",
  title: "How to Plan a Group Holiday Without Falling Out",
  description:
    "A practical guide to planning a group holiday: agreeing budgets and dates, voting on plans, sharing one itinerary and splitting costs fairly.",
  excerpt:
    "Budgets, dates, votes and money: how to organise a group trip without the group-chat chaos.",
  primaryKeyword: "how to plan a group holiday",
  secondaryKeywords: ["group trip planning", "organise a holiday with friends", "split holiday costs"],
  searchIntent: "Learn how to organise a group holiday",
  image: romeGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: [],
  sources: [
    { title: "FCDO: foreign travel checklist", url: "https://www.gov.uk/guidance/foreign-travel-checklist" },
  ],
  Content,
};
