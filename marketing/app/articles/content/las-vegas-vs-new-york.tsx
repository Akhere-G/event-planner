import { lasVegasGuide } from "../../destinations/guides/las-vegas";
import { newYorkGuide } from "../../destinations/guides/new-york";
import {
  ArticleSection,
  CheckList,
  ComparisonTable,
  DecisionBox,
  GuideLink,
  ItineraryLink,
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
        For many Brits, the first big American trip with friends comes down to
        Las Vegas or New York. Both are bucket-list cities with world-famous
        shows and nights out, but they offer very different holidays. New York
        is a walking city of neighbourhoods, museums, food and skyline views.
        Las Vegas is a desert playground of resorts, pools, shows and casinos,
        with national parks a short drive away.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>New York</strong> for sightseeing, food, Broadway and
          the feeling of walking through a film set, ideally over a week. Choose{" "}
          <strong>Las Vegas</strong> for a celebration built around pool parties,
          shows and big nights, plus the Grand Canyon.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Las Vegas"
        secondLabel="New York"
        rows={[
          { criterion: "Suggested stay", first: "4 days", second: "5–7 days" },
          { criterion: "Best fit", first: "Celebrations and pool parties", second: "Sightseeing, food and culture" },
          { criterion: "Shows", first: "Cirque, residencies, the Sphere", second: "Broadway and live music" },
          { criterion: "Getting around", first: "Walking the Strip, taxis beyond", second: "Subway and walking" },
          { criterion: "Day trips", first: "Grand Canyon, Red Rock, Valley of Fire", second: "Brooklyn, Coney Island, the Hudson Valley" },
          { criterion: "Best months", first: "Spring and autumn", second: "Spring, autumn and December" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          New York hotels are among the most expensive anywhere, so groups often
          rent apartments or stay outside Manhattan. Vegas rooms can be cheaper
          midweek, but resort fees, shows and pool cabanas add up quickly. Add US
          tipping to every budget.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Las Vegas</Subheading>
        <p>Buffets, celebrity-chef restaurants and late-night food courts.</p>
        <Subheading>New York</Subheading>
        <p>
          Pizza slices, bagels, delis, food halls and restaurants from every
          cuisine. Eating is one of the main reasons to visit.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Sights">
        <p>
          New York’s list is endless: Central Park, the Empire State Building,
          the Statue of Liberty, the Met, the High Line and Brooklyn. Vegas
          offers the Strip’s spectacle, the fountains, Fremont Street and
          desert scenery nearby.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.vegasSignDay}
        caption="The Welcome to Fabulous Las Vegas sign on the south end of the Strip."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          New York is easy on the subway and on foot. On the Strip, walking works
          but takes longer than it looks; taxis and ride-hailing cover the rest.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In New York, Midtown is central for first-timers, while the Lower East
          Side and Brooklyn suit nightlife. In Vegas, a mid-Strip resort puts most
          things within walking distance.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.nycMidtown}
        caption="Midtown Manhattan after dark, with Broadway theatres a short walk away."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Vegas packs clubs, day clubs and bars into one Strip. New York’s
          nightlife is spread across neighbourhoods, from rooftop bars to live
          music. Remember the legal drinking age in the US is 21.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Las Vegas or New York?">
        <CheckList>
          <li><strong>Choose Las Vegas</strong> for a celebration with pools, shows and the Grand Canyon.</li>
          <li><strong>Choose New York</strong> for sightseeing, food and a week of exploring.</li>
        </CheckList>
        <p>
          See the{" "}
          <GuideLink slug="las-vegas-travel-guide">Las Vegas travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={lasVegasGuide.templateSlug}>
            four-day Las Vegas itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="new-york-travel-guide">New York travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={newYorkGuide.templateSlug}>
            one-week New York itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Fit a week of sights into a plan that works">
        Pick the sights, let the optimiser group each day by neighbourhood and
        review the plan before anything changes.
      </TripTrackCta>
    </>
  );
}

export const lasVegasVsNewYorkArticle: TravelArticle = {
  slug: "las-vegas-vs-new-york",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Las Vegas vs New York: Which US Trip Should Your Group Take?",
  description:
    "Compare Las Vegas and New York for a group trip: cost, shows and nightlife, food, sights, getting around, where to stay and how long to go for.",
  excerpt:
    "Pools, shows and the Grand Canyon, or a week of neighbourhoods, food and Broadway? How Las Vegas and New York compare.",
  primaryKeyword: "Las Vegas vs New York",
  secondaryKeywords: ["Vegas or New York", "first USA trip with friends", "New York group trip"],
  searchIntent: "Help a group choose between two US city trips",
  image: lasVegasGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 5,
  relatedGuideSlugs: ["las-vegas-travel-guide", "new-york-travel-guide"],
  sources: [
    { title: "Visit Las Vegas: official tourism site", url: "https://www.visitlasvegas.com/" },
    { title: "New York City Tourism", url: "https://www.nyctourism.com/" },
    { title: "FCDO travel advice: USA", url: "https://www.gov.uk/foreign-travel-advice/usa" },
  ],
  Content,
};
