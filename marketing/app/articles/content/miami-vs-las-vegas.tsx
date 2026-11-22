import { lasVegasGuide } from "../../destinations/guides/las-vegas";
import { miamiGuide } from "../../destinations/guides/miami";
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
        Miami and Las Vegas are the two American cities most often chosen for a
        bucket-list stag, hen or big birthday. Both promise pool parties, huge
        nights out and a sense of occasion. Miami has the beach, the Art Deco
        streets and a Latin soul. Las Vegas has the Strip, the shows and the
        desert, with the Grand Canyon within reach.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Miami</strong> if beaches, sunshine and a
          neighbourhood-hopping city matter most. Choose{" "}
          <strong>Las Vegas</strong> if you want everything in one place: pool
          parties, shows, restaurants and casinos on the Strip, plus desert day
          trips.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Miami"
        secondLabel="Las Vegas"
        rows={[
          { criterion: "Suggested stay", first: "4–5 days", second: "4 days" },
          { criterion: "Best fit", first: "Beach, food and nightlife", second: "Shows, pool parties and casinos" },
          { criterion: "Beach", first: "Yes, South Beach and Key Biscayne", second: "No, resort pools instead" },
          { criterion: "Big day out", first: "Everglades airboat tour", second: "Grand Canyon" },
          { criterion: "Best months", first: "November to April", second: "March to May, September to November" },
          { criterion: "Getting around", first: "Ride-hailing between neighbourhoods", second: "Walking the Strip, taxis beyond" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Both can be expensive. Vegas hotel rooms can look cheap midweek, but
          resort fees, show tickets and pool-party cabanas add up, and weekend
          prices jump. Miami’s beach hotels and clubs are pricey, especially in
          peak season. In both, add US tipping to your budget.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Miami</Subheading>
        <p>
          Cuban food in Little Havana, stone crabs, ceviche and late-night
          sandwiches after the clubs.
        </p>
        <Subheading>Las Vegas</Subheading>
        <p>
          Celebrity-chef restaurants, giant buffets and late-night pizza and
          burgers on the Strip.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Things to do">
        <p>
          Miami: South Beach, Ocean Drive, the Wynwood Walls, Little Havana and
          the Everglades. Las Vegas: the Bellagio fountains, headline shows, the
          Sphere, Fremont Street and day trips to Red Rock Canyon or the Grand
          Canyon.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.miamiOceanSunset}
        caption="Ocean Drive at sunset, where South Beach’s Art Deco hotels start to light up."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          The Strip is walkable, though distances between resorts are longer than
          they look. Miami needs ride-hailing between South Beach, Wynwood,
          Brickell and Little Havana.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Vegas, stay mid-Strip to walk to most things. In Miami, South Beach
          suits a beach-and-clubs trip, while Wynwood suits bars and art.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.vegasSign}
        caption="The Welcome to Fabulous Las Vegas sign at the south end of the Strip is the classic first group photo."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Both are among the best party cities in the US. Vegas puts clubs, day
          clubs and shows within a short walk; Miami’s clubs run very late and
          mix with a beach and Latin music scene. The legal drinking age in both
          is 21, and venues check ID.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          Miami is best from November to April. Vegas is pleasant in spring and
          autumn; summer is extremely hot but pool season is in full swing.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Miami or Las Vegas?">
        <CheckList>
          <li><strong>Choose Miami</strong> for beaches, food and a city to explore.</li>
          <li><strong>Choose Las Vegas</strong> for shows, pool parties and the Grand Canyon.</li>
          <li><strong>Can’t decide?</strong> Direct flights between them make a two-city trip possible.</li>
        </CheckList>
        <p>
          Read the{" "}
          <GuideLink slug="miami-travel-guide">Miami travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={miamiGuide.templateSlug}>
            four-day Miami itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="las-vegas-travel-guide">Las Vegas travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={lasVegasGuide.templateSlug}>
            four-day Las Vegas itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Get everyone’s flights in one place">
        Save each person’s flights, line up shows and pool parties on a shared
        calendar and split the tables and tickets fairly.
      </TripTrackCta>
    </>
  );
}

export const miamiVsLasVegasArticle: TravelArticle = {
  slug: "miami-vs-las-vegas",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Miami vs Las Vegas: Which Is Better for a Stag, Hen or Big Birthday?",
  description:
    "Compare Miami and Las Vegas for a group celebration: cost, pool parties and nightlife, beaches, shows, day trips, getting around and the best time to go.",
  excerpt:
    "South Beach or the Strip? How Miami and Las Vegas compare for a bucket-list group trip.",
  primaryKeyword: "Miami vs Las Vegas",
  secondaryKeywords: ["Miami or Vegas", "Vegas stag do", "Miami bachelor party"],
  searchIntent: "Help a group choose between two US party cities",
  image: miamiGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["miami-travel-guide", "las-vegas-travel-guide"],
  sources: [
    { title: "Greater Miami Convention & Visitors Bureau", url: "https://www.miamiandbeaches.com/" },
    { title: "Visit Las Vegas: official tourism site", url: "https://www.visitlasvegas.com/" },
    { title: "FCDO travel advice: USA", url: "https://www.gov.uk/foreign-travel-advice/usa" },
  ],
  Content,
};
