import { krakowGuide } from "../../destinations/guides/krakow";
import { pragueGuide } from "../../destinations/guides/prague";
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
        Kraków and Prague both offer fairy-tale old towns, castles above a
        river and famously good beer, which is why they so often end up on the
        same shortlist. Prague is the more famous of the two, with a larger and
        more dramatic historic centre. Kraków is smaller, usually cheaper and a
        little less crowded, with important day trips close by.
      </p>
      <p>
        For a group, the deciding factors tend to be budget, crowds and how
        much the trip is about history versus nightlife.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Prague</strong> for the bigger showpiece: Charles
          Bridge, Prague Castle and the Old Town Square, plus a famous beer
          culture. Choose <strong>Kraków</strong> for a more compact, better
          value break with a lively bar scene in Kazimierz and day trips to
          Auschwitz-Birkenau and the Wieliczka salt mine.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Kraków"
        secondLabel="Prague"
        rows={[
          { criterion: "Suggested stay", first: "3 days", second: "3 days" },
          { criterion: "Best fit", first: "Value, history and day trips", second: "Iconic architecture and beer" },
          { criterion: "Crowds", first: "Busy in summer but manageable", second: "Very busy in the historic core" },
          { criterion: "Castle", first: "Wawel, above the Vistula", second: "Prague Castle, above the Vltava" },
          { criterion: "Getting around", first: "Walking and trams", second: "Walking, trams and metro" },
          { criterion: "Currency", first: "Polish złoty", second: "Czech koruna" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Kraków is generally cheaper for meals, drinks and accommodation than
          central Prague, where prices around the Old Town Square and Charles
          Bridge are aimed at visitors. In both cities, stepping a few streets
          away from the main sights makes a noticeable difference.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food and drink">
        <Subheading>Kraków</Subheading>
        <p>
          Pierogi, soups, beer halls and late-night zapiekanki make Kraków an
          easy city to eat well on a budget.
        </p>
        <Subheading>Prague</Subheading>
        <p>
          Prague is famous for Czech lager, served in traditional pubs and beer
          halls, and for hearty dishes like svíčková and roast pork with
          dumplings.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Sights">
        <p>
          Prague’s Charles Bridge, Prague Castle, the Old Town Square and its
          astronomical clock make it one of Europe’s most photogenic cities. Go
          early to enjoy them before the crowds.
        </p>
        <p>
          Kraków’s Main Market Square is one of the largest medieval squares in
          Europe, and Wawel Castle and Kazimierz are within walking distance.
          The Auschwitz-Birkenau Memorial and Wieliczka salt mine are both easy
          to reach in a day.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.krakowSquare}
        caption="Kraków’s Old Town centres on one of the largest medieval squares in Europe."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Both centres are walkable. Prague has a metro as well as trams, which
          helps if you stay further out. Kraków’s compact core means many groups
          walk everywhere except the airport and day trips.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Prague, Old Town and Malá Strana are central but busy; Vinohrady and
          Žižkov are good-value neighbourhoods with their own bars. In Kraków,
          the Old Town and Kazimierz are the best bases for a group.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.pragueCharlesBridge}
        caption="Charles Bridge is Prague’s best-known landmark. Cross it early in the morning for fewer crowds."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Prague has a big bar and club scene and is a long-standing stag
          favourite. Kraków’s nightlife is concentrated in cellar bars around the
          Old Town and the bars of Kazimierz, which makes it easy for a group to
          hop between places on foot.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          Spring and early autumn are lovely in both cities, with fewer crowds
          than summer. December brings Christmas markets but cold weather.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How long to stay">
        <p>
          Three days suits both cities. In Kraków, plan one day each for the two
          main day trips; in Prague, allow a full day for the castle district.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Kraków or Prague?">
        <CheckList>
          <li><strong>Choose Prague</strong> for iconic sights and a classic beer-city weekend.</li>
          <li><strong>Choose Kraków</strong> for value, fewer crowds and day trips with real meaning.</li>
        </CheckList>
        <p>
          See the{" "}
          <GuideLink slug="krakow-travel-guide">Kraków travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={krakowGuide.templateSlug}>
            three-day Kraków itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="prague-travel-guide">Prague travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={pragueGuide.templateSlug}>
            three-day Prague itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Book the timed tickets first">
        Pin the day trips and timed entries to the calendar, then fit bars and
        dinners around them so nobody misses the coach.
      </TripTrackCta>
    </>
  );
}

export const krakowVsPragueArticle: TravelArticle = {
  slug: "krakow-vs-prague",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Kraków vs Prague: Which City Break Should You Choose?",
  description:
    "Compare Kraków and Prague for a group city break: cost, crowds, food and beer, sights, nightlife, getting around, where to stay and how long to go for.",
  excerpt:
    "Two castle cities with great beer. How Kraków and Prague compare on value, crowds, sights and nights out.",
  primaryKeyword: "Krakow vs Prague",
  secondaryKeywords: ["Krakow or Prague", "Prague or Krakow stag do", "cheap European city break"],
  searchIntent: "Help travellers choose between two Central European city breaks",
  image: pragueGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["krakow-travel-guide", "prague-travel-guide"],
  sources: [
    { title: "Poland.travel: official tourism site", url: "https://www.poland.travel/en" },
    { title: "Prague City Tourism", url: "https://www.prague.eu/en" },
    { title: "FCDO travel advice: Poland", url: "https://www.gov.uk/foreign-travel-advice/poland" },
    { title: "FCDO travel advice: Czech Republic", url: "https://www.gov.uk/foreign-travel-advice/czech-republic" },
  ],
  Content,
};
