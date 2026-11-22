import { dubaiGuide } from "../../destinations/guides/dubai";
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
        Dubai and Miami are the two big “dream trip” cities for groups who want
        beaches, rooftop bars and a bit of glamour in the winter months. Both
        are warm from November to March, both have famous beach clubs and both
        reward dressing up. The difference is in the atmosphere: Dubai is
        polished, alcohol is mostly served in hotels, and the desert is close by.
        Miami is louder and looser, with Art Deco streets, Latin culture and a
        nightlife that runs until sunrise.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Dubai</strong> for luxury hotels, desert safaris and
          brunches in guaranteed sunshine, with a slightly shorter flight from
          the UK. Choose <strong>Miami</strong> for a big-night-out city with
          beaches, Cuban food, street art and the energy of South Beach.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Dubai"
        secondLabel="Miami"
        rows={[
          { criterion: "Suggested stay", first: "5 days", second: "4–5 days" },
          { criterion: "Flight time from UK", first: "About 7 hours", second: "About 9 to 10 hours" },
          { criterion: "Best months", first: "November to March", second: "November to April" },
          { criterion: "Nightlife", first: "Hotel bars, beach clubs, brunches", second: "South Beach clubs and Wynwood bars" },
          { criterion: "Big day out", first: "Desert safari", second: "Everglades airboat tour" },
          { criterion: "Entry", first: "Check UAE entry rules", second: "ESTA required for UK visitors" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Both cities can be expensive. Dubai has a wider range of hotel prices
          and package deals; Miami’s hotels and club tables are pricey, and US
          tipping adds to every bill. Compare like-for-like dates, and include
          the ESTA for Miami and transfers for both.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Dubai</Subheading>
        <p>
          Dubai’s brunches are legendary, and old Dubai has excellent cheap
          eats.
        </p>
        <Subheading>Miami</Subheading>
        <p>
          Miami is a Cuban and Latin American food city: café cubano and
          croquetas in Little Havana, stone crabs in South Beach and tacos in
          Wynwood.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Things to do">
        <p>
          Dubai offers the Burj Khalifa, the fountains, the souks, a desert
          safari and water parks. Miami has South Beach and Ocean Drive, the
          Wynwood Walls, Little Havana, Vizcaya and the Everglades.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.dubaiDesertCamels}
        caption="Camels resting in the desert outside Dubai. A safari with a camp dinner is a classic group evening."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Both cities are spread out and car-centric. Dubai’s metro and cheap
          taxis help; in Miami, ride-hailing is the easiest option between South
          Beach, Wynwood and Brickell.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Dubai, choose Downtown for sights or Marina, JBR and the Palm for
          beaches. In Miami, South Beach puts you near the sand and clubs, while
          Wynwood and Brickell suit groups who prefer bars and rooftops.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.miamiLifeguard}
        caption="Miami Beach’s colourful lifeguard huts are a South Beach landmark."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Miami is the bigger party city, with clubs that run very late. Dubai’s
          nightlife is glamorous but concentrated in licensed venues, and local
          laws on behaviour in public are strict. Check FCDO advice before you
          go.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          Both are best from November to March. Dubai becomes extremely hot in
          summer, while Miami’s summer is humid and falls within hurricane
          season.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Dubai or Miami?">
        <CheckList>
          <li><strong>Choose Dubai</strong> for luxury, desert and brunches.</li>
          <li><strong>Choose Miami</strong> for beaches, Latin culture and late nights.</li>
        </CheckList>
        <p>
          Explore the{" "}
          <GuideLink slug="dubai-travel-guide">Dubai travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={dubaiGuide.templateSlug}>
            five-day Dubai itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="miami-travel-guide">Miami travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={miamiGuide.templateSlug}>
            four-day Miami itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Plan a long-haul group trip without the spreadsheet">
        Save everyone’s flights, build the days together and split hotel and
        table bookings across currencies, all in one shared trip.
      </TripTrackCta>
    </>
  );
}

export const dubaiVsMiamiArticle: TravelArticle = {
  slug: "dubai-vs-miami",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Dubai vs Miami: Which Dream Trip Suits Your Group?",
  description:
    "Compare Dubai and Miami for a group dream trip: flight time, cost, beaches, nightlife, food, things to do, where to stay and the best months to go.",
  excerpt:
    "Desert luxury or South Beach energy? How Dubai and Miami compare for a winter-sun group trip.",
  primaryKeyword: "Dubai vs Miami",
  secondaryKeywords: ["Dubai or Miami", "luxury group holiday", "winter sun long haul"],
  searchIntent: "Help a group choose between two long-haul sun destinations",
  image: dubaiGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["dubai-travel-guide", "miami-travel-guide"],
  sources: [
    { title: "Visit Dubai: official tourism site", url: "https://www.visitdubai.com/en" },
    { title: "Greater Miami Convention & Visitors Bureau", url: "https://www.miamiandbeaches.com/" },
    { title: "FCDO travel advice: United Arab Emirates", url: "https://www.gov.uk/foreign-travel-advice/united-arab-emirates" },
    { title: "FCDO travel advice: USA", url: "https://www.gov.uk/foreign-travel-advice/usa" },
  ],
  Content,
};
