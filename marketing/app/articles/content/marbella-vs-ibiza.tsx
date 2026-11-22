import { ibizaGuide } from "../../destinations/guides/ibiza";
import { marbellaGuide } from "../../destinations/guides/marbella";
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
        Marbella and Ibiza are the two Spanish favourites for hen dos, stag
        weekends and big birthdays. Both promise sun, beach clubs and late
        nights, but they deliver them in different ways. Marbella is a mainland
        resort with a pretty old town, the glitz of Puerto Banús and easy flights
        into Málaga. Ibiza is an island where the club scene is world famous and
        the coves, villages and sunsets are a big part of the draw.
      </p>
      <p>
        For a group organiser, the biggest differences are the type of night
        out, how easy it is to get there and around, and how much the group
        wants a party island atmosphere. Here is how they compare.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Marbella</strong> for a polished hen or birthday
          weekend with beach clubs, smart dinners and easy logistics from
          Málaga airport. Choose <strong>Ibiza</strong> if the group wants
          superclubs, sunset bars and an island atmosphere, and is happy with a
          bit more planning around taxis and tickets.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Marbella"
        secondLabel="Ibiza"
        rows={[
          { criterion: "Suggested stay", first: "3–4 days", second: "4 days" },
          {
            criterion: "Best fit",
            first: "Hen dos, birthdays, mixed-age groups",
            second: "Clubbers and dedicated party trips",
          },
          {
            criterion: "Nightlife style",
            first: "Beach clubs and Puerto Banús bars",
            second: "Superclubs, residencies and sunset bars",
          },
          {
            criterion: "Getting there",
            first: "Málaga airport, about 45 minutes away",
            second: "Ibiza airport, close to most resorts",
          },
          {
            criterion: "Season",
            first: "Most of the year, beach clubs busiest in summer",
            second: "Late May to early October",
          },
          {
            criterion: "Day trips",
            first: "Ronda, Málaga, golf",
            second: "Formentera, hippy markets, hidden coves",
          },
        ]}
      />

      <ArticleSection id="cost" title="Cost: compare the whole weekend">
        <p>
          Both destinations can be expensive at peak times. Marbella often has
          more flight choices because Málaga is served by many UK airports, which
          can help keep fares down for a group flying from different cities.
          Ibiza flights rise sharply in summer, and club tickets add up quickly.
        </p>
        <p>
          The biggest swing is accommodation. A shared villa split between eight
          people can be cheaper per person than hotel rooms in either place.
          Add beach-club bed bookings and minimum spends to your budget early,
          as these vary widely.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Marbella: tapas and smart restaurants</Subheading>
        <p>
          Marbella’s old town has proper tapas bars such as Bar El Estrecho, and
          the Golden Mile has polished group dinners at places like Bibo and
          Leña. Puerto Banús leans towards lively restaurants that turn into
          parties later on.
        </p>
        <Subheading>Ibiza: village bars and seafood with a view</Subheading>
        <p>
          On Ibiza, head inland for long lunches in villages like Santa
          Gertrudis, or to the coast for seafood with sunset views. Eating well
          away from the busiest resorts is usually better value.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Beyond the beach">
        <p>
          Marbella’s old town, with the Plaza de los Naranjos, is a pleasant
          contrast to the resort strip, and a day trip to the clifftop town of
          Ronda is one of the best in southern Spain. Golfers are spoiled for
          choice along the coast.
        </p>
        <p>
          Ibiza’s extras are more about nature: Formentera’s beaches by fast
          ferry, the rock of Es Vedrà, hidden coves and the walled old town of
          Dalt Vila.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.puertoBanusYacht}
        caption="Puerto Banús is Marbella’s glitzy marina, with yachts by day and bars and clubs at night."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Marbella is easy: taxis are plentiful, the old town and seafront are
          walkable, and Puerto Banús is a short ride away. Many groups never need
          a car.
        </p>
        <p>
          Ibiza needs more planning. Taxis can be hard to find late at night in
          high season, so groups often pre-book transfers or hire a car for
          daytime trips. Summer disco buses help on club nights.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <Subheading>Marbella</Subheading>
        <p>
          Stay near the old town or seafront for walkable evenings, on the Golden
          Mile for luxury, or in a villa in the hills for space and a private
          pool.
        </p>
        <Subheading>Ibiza</Subheading>
        <p>
          Sant Antoni and Platja d’en Bossa are closest to the nightlife. Ibiza
          Town is a good middle ground, while the north is quieter.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.ibizaSunset}
        caption="Sunset over the sea off Ibiza’s west coast is a ritual for many groups before a night out."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Marbella’s nights centre on beach clubs such as Ocean Club and Nikki
          Beach, followed by dinner and bars in Puerto Banús. It suits groups who
          want to dress up and dance without committing to an all-night club.
        </p>
        <p>
          Ibiza is the stronger choice for serious clubbing, with headline DJs
          through the summer. Check the line-ups before you book your dates.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          Marbella has a longer season, with warm springs and autumns and mild
          winters, which makes it a good choice outside summer. Ibiza is best from
          late May to early October, when the clubs are open.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How long to stay">
        <p>
          A long weekend of three or four days works well for Marbella. For
          Ibiza, four days lets you combine a club night with recovery time and
          a day on Formentera.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Marbella or Ibiza: the verdict">
        <CheckList>
          <li>
            <strong>Choose Marbella</strong> for a polished, easy hen do or
            birthday with beach clubs and great dinners.
          </li>
          <li>
            <strong>Choose Ibiza</strong> for clubbing, sunsets and an island
            feel.
          </li>
          <li>
            <strong>Outside summer</strong>, Marbella is usually the better bet.
          </li>
        </CheckList>
        <p>
          Read the{" "}
          <GuideLink slug="marbella-travel-guide">Marbella travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={marbellaGuide.templateSlug}>
            four-day Marbella itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="ibiza-travel-guide">Ibiza travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={ibizaGuide.templateSlug}>
            four-day Ibiza itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Plan the weekend everyone has signed up for">
        Share one itinerary with the whole group, collect votes on beach clubs,
        and track who has paid for the villa, so the organiser isn’t chasing
        money on the group chat.
      </TripTrackCta>
    </>
  );
}

export const marbellaVsIbizaArticle: TravelArticle = {
  slug: "marbella-vs-ibiza",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Marbella vs Ibiza: Which Is Better for a Hen Do or Group Trip?",
  description:
    "Marbella or Ibiza for a hen do, stag or birthday? Compare costs, beach clubs and nightlife, food, getting around, where to stay and the best time to go.",
  excerpt:
    "Beach clubs and Puerto Banús, or superclubs and island sunsets? How Marbella and Ibiza compare for group celebrations.",
  primaryKeyword: "Marbella vs Ibiza",
  secondaryKeywords: ["Marbella or Ibiza hen do", "Marbella or Ibiza", "best hen do destination Spain"],
  searchIntent: "Help a group choose between two Spanish party destinations",
  image: marbellaGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 7,
  relatedGuideSlugs: ["marbella-travel-guide", "ibiza-travel-guide"],
  sources: [
    { title: "Spain.info: official tourism site", url: "https://www.spain.info/en/" },
    { title: "Ibiza Tourism Board", url: "https://ibiza.travel/en/" },
    { title: "FCDO travel advice: Spain", url: "https://www.gov.uk/foreign-travel-advice/spain" },
  ],
  Content,
};
