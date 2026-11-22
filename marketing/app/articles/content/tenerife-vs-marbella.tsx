import { marbellaGuide } from "../../destinations/guides/marbella";
import { tenerifeGuide } from "../../destinations/guides/tenerife";
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
        Tenerife and Marbella are two of the most popular Spanish choices for
        group sun holidays from the UK, and the choice often comes down to the
        calendar. Tenerife, in the Atlantic off Africa, stays warm all winter.
        Marbella, on the Costa del Sol, is at its best from spring to autumn and
        offers a smarter resort scene with Puerto Banús on the doorstep.
      </p>
      <p>
        They also suit different groups. Tenerife mixes lively resorts with
        volcanic landscapes and adventure, while Marbella is about beach clubs,
        good restaurants and a pretty old town. Here is how to choose.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Tenerife</strong> for winter sun, a big-resort party
          scene in the south and adventure such as Mount Teide and whale
          watching. Choose <strong>Marbella</strong> for a glamorous long weekend
          of beach clubs and dinners from late spring to autumn, with a shorter
          flight and an easy transfer from Málaga.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Tenerife"
        secondLabel="Marbella"
        rows={[
          { criterion: "Suggested stay", first: "5 days to a week", second: "3–4 days" },
          { criterion: "Best season", first: "All year, especially winter", second: "April to October" },
          { criterion: "Flight time from UK", first: "About 4 to 4.5 hours", second: "About 2.5 to 3 hours to Málaga" },
          { criterion: "Best fit", first: "Winter sun, adventure, lively resorts", second: "Beach clubs, dinners, hen dos" },
          { criterion: "Nightlife", first: "Playa de las Américas and the Veronicas strip", second: "Puerto Banús and beach clubs" },
          { criterion: "Standout day out", first: "Mount Teide", second: "Ronda" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Tenerife has a huge range of package holidays and apartments, which
          often makes it good value for groups, especially outside school
          holidays. Marbella can be pricier for hotels and beach clubs, but its
          shorter flights and wide choice of UK departure airports can balance
          things out.
        </p>
        <p>
          For a fair comparison, price the same dates, room types and group size,
          and add car hire for Tenerife if you plan to explore the island.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Tenerife: Canarian cooking and fish by the harbour</Subheading>
        <p>
          Try papas arrugadas with mojo sauces, grilled cheese and fresh fish in
          harbour villages such as Los Abrigos. In the north, informal
          guachinches serve home cooking with local wine.
        </p>
        <Subheading>Marbella: tapas and polished group dinners</Subheading>
        <p>
          Marbella has traditional tapas bars in the old town and plenty of
          stylish restaurants on the Golden Mile and in Puerto Banús, many of
          which suit a big table.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Things to do">
        <p>
          Tenerife has more adventure: the cable car up Mount Teide, boat trips
          below the Los Gigantes cliffs to see whales and dolphins, the ravine
          village of Masca and the big Siam Park water park.
        </p>
        <p>
          Marbella’s highlights are gentler: the old town, beach clubs, Puerto
          Banús and day trips to Ronda or Málaga.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.teideClouds}
        caption="High above the clouds: a sunset trip up into Teide National Park is the classic Tenerife day out. Pack a warm layer."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Tenerife is large, so hiring a car makes day trips far easier. The
          south’s resorts are close to Tenerife South airport.
        </p>
        <p>
          Marbella is compact, with taxis and walking enough for most trips.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Tenerife, Costa Adeje and Playa de las Américas suit groups who want
          pools, beaches and nightlife; Puerto de la Cruz and La Laguna in the
          north suit a quieter trip. In Marbella, stay near the old town or
          seafront to walk to dinner, or book a villa in the hills for space.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.puertoBanusEntrance}
        caption="Yachts at the entrance to Puerto Banús, Marbella’s marina for dinner, bars and people-watching."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Tenerife’s south has a busy bar and club scene on the Veronicas strip
          and plenty of beach clubs. Marbella is more about dressing up for
          beach clubs by day and Puerto Banús by night.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          Tenerife is the clear winner from November to March, when Marbella is
          mild but not reliably beach weather. From May to September both are
          warm, and Marbella’s beach clubs are in full swing.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How long to stay">
        <p>
          Give Tenerife five days or more to fit in Teide and the north as well
          as beach time. Three or four days is enough for Marbella.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Tenerife or Marbella?">
        <CheckList>
          <li><strong>Choose Tenerife</strong> for winter sun, adventure and lively resorts.</li>
          <li><strong>Choose Marbella</strong> for a summer long weekend of beach clubs and dinners.</li>
          <li><strong>Check the month first</strong>: it often decides this one for you.</li>
        </CheckList>
        <p>
          See the{" "}
          <GuideLink slug="tenerife-travel-guide">Tenerife travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={tenerifeGuide.templateSlug}>
            five-day Tenerife itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="marbella-travel-guide">Marbella travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={marbellaGuide.templateSlug}>
            four-day Marbella itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Line up the days before you book">
        Drop Teide, beach clubs and dinners onto a shared calendar, check the
        days work for everyone and split the car hire or villa as you go.
      </TripTrackCta>
    </>
  );
}

export const tenerifeVsMarbellaArticle: TravelArticle = {
  slug: "tenerife-vs-marbella",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Tenerife vs Marbella: Which Sun Holiday Suits Your Group?",
  description:
    "Compare Tenerife and Marbella for group holidays: winter sun, cost, nightlife, food, things to do, getting around, where to stay and how long to go for.",
  excerpt:
    "Year-round sun and volcanic adventure, or beach clubs and Puerto Banús? How Tenerife and Marbella compare.",
  primaryKeyword: "Tenerife vs Marbella",
  secondaryKeywords: ["Tenerife or Marbella", "winter sun group holiday", "Tenerife hen do"],
  searchIntent: "Help a group choose between two Spanish sun destinations",
  image: tenerifeGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["tenerife-travel-guide", "marbella-travel-guide"],
  sources: [
    { title: "Tenerife Tourism", url: "https://www.webtenerife.co.uk/" },
    { title: "Spain.info: official tourism site", url: "https://www.spain.info/en/" },
    { title: "FCDO travel advice: Spain", url: "https://www.gov.uk/foreign-travel-advice/spain" },
  ],
  Content,
};
