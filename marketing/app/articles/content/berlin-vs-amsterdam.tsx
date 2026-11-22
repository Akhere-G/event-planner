import { amsterdamGuide } from "../../destinations/guides/amsterdam";
import { berlinGuide } from "../../destinations/guides/berlin";
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
        Berlin and Amsterdam are both short flights from the UK and both are
        famous for their nightlife, which makes them natural rivals for a group
        weekend. Yet they feel very different. Amsterdam is compact and pretty,
        with canals, bikes and world-class museums packed into a small centre.
        Berlin is sprawling, gritty and creative, with history on every corner
        and clubs that run all weekend.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Amsterdam</strong> for a beautiful, walkable city of
          canals, museums and cosy bars over a long weekend. Choose{" "}
          <strong>Berlin</strong> for 20th-century history, big neighbourhoods
          to explore and a club scene that is among the best in the world.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Berlin"
        secondLabel="Amsterdam"
        rows={[
          { criterion: "Suggested stay", first: "4 days", second: "3 days" },
          { criterion: "Best fit", first: "History and serious clubbing", second: "Canals, museums and cosy bars" },
          { criterion: "City size", first: "Huge and spread out", second: "Compact centre" },
          { criterion: "Getting around", first: "U-Bahn, S-Bahn and trams", second: "Walking, trams and bikes" },
          { criterion: "Cost feel", first: "Moderate for a capital", second: "Expensive, especially hotels" },
          { criterion: "Standout", first: "The Wall and Museum Island", second: "Rijksmuseum and the canal ring" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Amsterdam’s hotels are among the most expensive in Europe and a tourist
          tax applies, so groups often find Berlin cheaper for accommodation and
          eating out. Berlin’s public transport passes are good value for a
          sprawling city. Check prices for your actual dates, especially around
          big events.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Berlin: döner, currywurst and market halls</Subheading>
        <p>
          Berlin is great for cheap street food, from Mustafa’s vegetable kebabs
          to currywurst at Curry 36, plus market halls and beer gardens.
        </p>
        <Subheading>Amsterdam: brown cafés and Indonesian rijsttafel</Subheading>
        <p>
          Amsterdam’s brown cafés and food halls suit groups, and an Indonesian
          rijsttafel is a good shared dinner.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Sights">
        <p>
          Berlin’s big sights are tied to its history: the Brandenburg Gate, the
          Reichstag dome, the Berlin Wall Memorial and the East Side Gallery.
          Museum Island adds world-class collections.
        </p>
        <p>
          Amsterdam’s highlights include the Rijksmuseum, the Van Gogh Museum,
          the Anne Frank House and a canal cruise. Book timed tickets well ahead.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.berlinWallBike}
        caption="Street art covers walls all over Berlin, from the East Side Gallery to the courtyards of Kreuzberg."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Berlin’s U-Bahn and S-Bahn cover a huge area and run through the night
          at weekends. Amsterdam’s centre is easy on foot, with trams and bikes
          for longer trips. Cycle only if your group is confident in busy bike
          traffic.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Berlin, Mitte is central for sights, while Friedrichshain and
          Kreuzberg are closer to bars and clubs. In Amsterdam, the canal ring
          and Jordaan are beautiful but pricey; De Pijp and Oost offer better
          value with good bars.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.amsterdamCanalHouses}
        caption="Amsterdam’s canal houses make the city one of Europe’s most walkable weekend breaks."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Berlin’s club culture is legendary, with venues that open late on
          Saturday and keep going through Sunday. Door policies can be strict,
          and smaller groups often have better luck. Amsterdam has lively bars
          around Leidseplein and Rembrandtplein and a strong club scene of its
          own, but in a more compact, earlier-finishing package.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          Late spring and summer are best for both, with beer gardens, terraces
          and long evenings. Amsterdam’s tulip season in April is busy. Winter
          brings Christmas markets in Berlin and cosy cafés in Amsterdam.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How long to stay">
        <p>
          Berlin rewards four days because of its size. Amsterdam works well as a
          three-day weekend.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Berlin or Amsterdam?">
        <CheckList>
          <li><strong>Choose Berlin</strong> for history, value and serious clubbing.</li>
          <li><strong>Choose Amsterdam</strong> for a beautiful, compact weekend of canals and museums.</li>
        </CheckList>
        <p>
          Read the{" "}
          <GuideLink slug="berlin-travel-guide">Berlin travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={berlinGuide.templateSlug}>
            four-day Berlin itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="amsterdam-travel-guide">Amsterdam travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={amsterdamGuide.templateSlug}>
            three-day Amsterdam itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Stop the zigzag across the city">
        Group each day’s stops by neighbourhood on the map, so a big city like
        Berlin doesn’t eat your weekend in transit.
      </TripTrackCta>
    </>
  );
}

export const berlinVsAmsterdamArticle: TravelArticle = {
  slug: "berlin-vs-amsterdam",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Berlin vs Amsterdam: Which City Break Is Right for Your Group?",
  description:
    "Compare Berlin and Amsterdam for a group city break: cost, nightlife and clubs, sights, food, getting around, where to stay and how long to stay.",
  excerpt:
    "History and all-weekend clubs, or canals and museums? How Berlin and Amsterdam compare for a group weekend.",
  primaryKeyword: "Berlin vs Amsterdam",
  secondaryKeywords: ["Berlin or Amsterdam", "Berlin or Amsterdam stag do", "best European nightlife city"],
  searchIntent: "Help a group choose between two European city breaks",
  image: berlinGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["berlin-travel-guide", "amsterdam-travel-guide"],
  sources: [
    { title: "visitBerlin: official tourism site", url: "https://www.visitberlin.de/en" },
    { title: "I amsterdam: neighbourhoods", url: "https://www.iamsterdam.com/en/explore/neighbourhoods" },
    { title: "FCDO travel advice: Germany", url: "https://www.gov.uk/foreign-travel-advice/germany" },
    { title: "FCDO travel advice: Netherlands", url: "https://www.gov.uk/foreign-travel-advice/netherlands" },
  ],
  Content,
};
