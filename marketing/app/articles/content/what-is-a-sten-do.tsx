import { marbellaGuide } from "../../destinations/guides/marbella";
import {
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
        A sten do (stag plus hen) is a joint pre-wedding celebration for both
        halves of the couple and their friends. Instead of two separate weekends,
        everyone goes away together. Skyscanner’s UK travel trends report for
        2027 names the “Sten Do Surge” as one of the year’s trends, under the
        tagline “one trip, one celebration, everyone’s invited”.
      </p>
      <p>
        It makes sense: many couples share a friendship group, guests save money
        by going to one event rather than two, and the whole thing feels more
        like a holiday than an endurance test. It does, however, make
        organising bigger and trickier.
      </p>

      <DecisionBox>
        <p>
          A good sten do destination has easy flights from several UK airports,
          big group-friendly accommodation and a mix of activities that suit
          everyone. <strong>Marbella</strong>, <strong>Ibiza</strong>,{" "}
          <strong>Kraków</strong>, <strong>Split</strong> and{" "}
          <strong>Tenerife</strong> all work well.
        </p>
      </DecisionBox>

      <ArticleSection id="why" title="Why sten dos are taking off">
        <CheckList>
          <li>Couples with shared friends don’t have to split the group.</li>
          <li>Guests pay for one trip instead of two.</li>
          <li>It is easier to plan around one date.</li>
          <li>The focus shifts from dares and drinking games to a shared holiday.</li>
        </CheckList>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.poolDive}
        caption="A villa with a pool gives a mixed group a base for the whole weekend."
      />

      <ArticleSection id="where" title="Where to go">
        <Subheading>Marbella</Subheading>
        <p>
          Beach clubs, big villas in the hills and restaurants that suit long
          group dinners. See the{" "}
          <GuideLink slug="marbella-travel-guide">Marbella travel guide</GuideLink>.
        </p>
        <Subheading>Ibiza</Subheading>
        <p>
          For couples who want a proper party, with quieter coves for the next
          day. Read the <GuideLink slug="ibiza-travel-guide">Ibiza travel guide</GuideLink>.
        </p>
        <Subheading>Kraków</Subheading>
        <p>
          Great value for big groups with different budgets. See the{" "}
          <GuideLink slug="krakow-travel-guide">Kraków travel guide</GuideLink>.
        </p>
        <Subheading>Split</Subheading>
        <p>
          A boat day to the islands is a perfect sten do activity. Read the{" "}
          <GuideLink slug="split-travel-guide">Split travel guide</GuideLink>.
        </p>
        <Subheading>Tenerife</Subheading>
        <p>
          The best option for a winter wedding. See the{" "}
          <GuideLink slug="tenerife-travel-guide">Tenerife travel guide</GuideLink>.
        </p>
      </ArticleSection>

      <ArticleSection id="planning" title="How to plan a sten do">
        <CheckList>
          <li>Agree who is organising: one person, or one from each side.</li>
          <li>Set a budget early and keep at least one free or cheap activity each day.</li>
          <li>Book accommodation with enough bedrooms and bathrooms, and agree how to split it.</li>
          <li>Plan one big shared moment, such as a boat trip or long lunch.</li>
          <li>Leave time for smaller groups to do their own thing.</li>
          <li>Ask the couple what they definitely don’t want.</li>
        </CheckList>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.friendsToast}
        caption="Plan at least one moment where the whole group is together to toast the couple."
      />

      <TripTrackCta title="One trip, one plan, everyone’s invited">
        Invite both sides to the same shared trip, let them vote on activities
        and split the villa and boat costs between the right people.
      </TripTrackCta>
    </>
  );
}

export const whatIsAStenDoArticle: TravelArticle = {
  slug: "what-is-a-sten-do",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "What Is a Sten Do? The Joint Stag and Hen Trend, Explained",
  description:
    "What is a sten do? How the joint stag and hen trend works, why it is rising in 2027, the best destinations and how to plan one for a mixed group.",
  excerpt:
    "One trip, one celebration, both sides of the wedding party: how sten dos work and where to go.",
  primaryKeyword: "sten do",
  secondaryKeywords: ["what is a sten do", "joint stag and hen", "sten do ideas abroad"],
  searchIntent: "Understand and plan a joint stag and hen do",
  image: marbellaGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 4,
  relatedGuideSlugs: ["marbella-travel-guide", "ibiza-travel-guide", "split-travel-guide"],
  sources: [
    { title: "Skyscanner: UK Travel Trends 2027", url: "https://www.skyscanner.net/travel-trends" },
    { title: "FCDO: foreign travel advice", url: "https://www.gov.uk/foreign-travel-advice" },
  ],
  Content,
};
