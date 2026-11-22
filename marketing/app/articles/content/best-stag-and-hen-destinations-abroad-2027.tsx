import { ibizaGuide } from "../../destinations/guides/ibiza";
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
        A stag or hen do abroad is one of the hardest trips to organise: a big
        group, different budgets, a fixed date and a lot of people messaging the
        organiser. Picking the right destination makes everything else easier.
        These are the places that keep working for UK groups, with a few newer
        ideas for 2027.
      </p>

      <DecisionBox>
        <p>
          On a budget: <strong>Kraków</strong> or <strong>Budapest</strong>.
          For sun and beach clubs: <strong>Marbella</strong> or{" "}
          <strong>Ibiza</strong>. For winter: <strong>Tenerife</strong>. For a
          once-in-a-lifetime blowout: <strong>Las Vegas</strong>.
        </p>
      </DecisionBox>

      <ArticleSection id="cities" title="City breaks">
        <Subheading>Kraków</Subheading>
        <p>
          Cheap drinks, cellar bars and a walkable old town. Pair a big night with
          a slower day at the salt mine. Read the{" "}
          <GuideLink slug="krakow-travel-guide">Kraków travel guide</GuideLink>.
        </p>
        <Subheading>Budapest</Subheading>
        <p>
          Ruin bars, river cruises and a thermal bath to recover. See the{" "}
          <GuideLink slug="budapest-travel-guide">Budapest travel guide</GuideLink>.
        </p>
        <Subheading>Prague, Amsterdam and Berlin</Subheading>
        <p>
          Prague for beer halls, Amsterdam for canals and bars, Berlin for serious
          clubbing. Compare them in{" "}
          <GuideLink slug="berlin-travel-guide">our Berlin guide</GuideLink> and{" "}
          <GuideLink slug="amsterdam-travel-guide">Amsterdam guide</GuideLink>.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.poolJump}
        caption="A villa with a pool turns any stag or hen into a party before you even go out."
      />

      <ArticleSection id="sun" title="Sun and beach clubs">
        <Subheading>Marbella</Subheading>
        <p>
          Ocean Club and Nikki Beach by day, Puerto Banús by night. A hen do
          classic. Read the{" "}
          <GuideLink slug="marbella-travel-guide">Marbella travel guide</GuideLink>.
        </p>
        <Subheading>Ibiza</Subheading>
        <p>
          The clubbing capital of Europe from late May to early October. See the{" "}
          <GuideLink slug="ibiza-travel-guide">Ibiza travel guide</GuideLink>.
        </p>
        <Subheading>Tenerife</Subheading>
        <p>
          Year-round sun and lively resorts, ideal for a winter do. Read the{" "}
          <GuideLink slug="tenerife-travel-guide">Tenerife travel guide</GuideLink>.
        </p>
      </ArticleSection>

      <ArticleSection id="big" title="The big ones">
        <p>
          For a milestone, <GuideLink slug="las-vegas-travel-guide">Las Vegas</GuideLink>{" "}
          and <GuideLink slug="miami-travel-guide">Miami</GuideLink> deliver pool
          parties, clubs and a sense of occasion, while{" "}
          <GuideLink slug="dubai-travel-guide">Dubai</GuideLink> and{" "}
          <GuideLink slug="marrakech-travel-guide">Marrakech</GuideLink> suit
          luxury hen dos with brunches, spas and riads.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.clubLights}
        caption="Plan the big night first, then build the rest of the weekend around it."
      />

      <ArticleSection id="tips" title="Organiser tips">
        <CheckList>
          <li>Confirm the date and budget with the bride or groom before anything else.</li>
          <li>Ask for deposits early, and track who has paid.</li>
          <li>Book group-friendly venues: many bars and clubs have rules for stag and hen groups.</li>
          <li>Plan one activity per day and leave the rest loose.</li>
          <li>Share the itinerary so nobody needs to ask where to be and when.</li>
        </CheckList>
      </ArticleSection>

      <TripTrackCta title="Stop chasing deposits">
        Share one plan with the whole group, log every payment and see at a
        glance who still owes what.
      </TripTrackCta>
    </>
  );
}

export const bestStagAndHenDestinationsAbroad2027Article: TravelArticle = {
  slug: "best-stag-and-hen-destinations-abroad-2027",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "Best Stag and Hen Do Destinations Abroad for 2027",
  description:
    "The best stag and hen do destinations abroad for 2027, from budget city breaks in Kraków and Budapest to Marbella, Ibiza, Tenerife and Las Vegas, plus organiser tips.",
  excerpt:
    "Where to take the stag or hen in 2027, by budget and season, with tips for the person organising it.",
  primaryKeyword: "best stag and hen destinations abroad 2027",
  secondaryKeywords: ["best hen do destinations 2027", "stag do abroad ideas", "cheap stag do destinations"],
  searchIntent: "Choose a destination for a stag or hen do abroad",
  image: ibizaGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 5,
  relatedGuideSlugs: ["krakow-travel-guide", "marbella-travel-guide", "las-vegas-travel-guide"],
  sources: [
    { title: "Skyscanner: UK Travel Trends 2027", url: "https://www.skyscanner.net/travel-trends" },
    { title: "FCDO: foreign travel advice", url: "https://www.gov.uk/foreign-travel-advice" },
  ],
  Content,
};
