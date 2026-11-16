import { seoulGuide } from "../../destinations/guides/seoul";
import { tokyoGuide } from "../../destinations/guides/tokyo";
import {
  ArticleSection,
  ComparisonTable,
  DecisionBox,
  GuideLink,
  ItineraryLink,
  Subheading,
  TripTrackCta,
} from "../components/ArticleElements";
import type { TravelArticle } from "../types";
import { ArticlePhoto } from "../components/ArticlePhoto";
import { articlePhotos } from "../photos";

function Content() {
  return (
    <>
      <p>
        Tokyo and Seoul both combine deep tradition with fast-moving contemporary
        culture, excellent public transport and food worth crossing a city for. The
        difference is scale and texture. Tokyo feels like many cities joined by rail;
        Seoul is more concentrated around palaces, mountains, the Han River and
        neighbourhoods that stay active late.
      </p>
      <p>
        There is no universal winner. The useful question is which city better fits
        your time, budget and interests, so this guide compares them on the same
        practical criteria.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Tokyo</strong> for the broadest range of neighbourhoods,
          Japanese food, design and day trips. Choose <strong>Seoul</strong> for
          palace history, late-night energy, Korean food, contemporary culture and a
          first trip that is slightly easier to contain within five days.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Tokyo"
        secondLabel="Seoul"
        rows={[
          { criterion: "Ideal stay", first: "5–7 days", second: "4–5 days" },
          { criterion: "Best for", first: "Neighbourhood variety and food depth", second: "Nightlife, palaces and contemporary culture" },
          { criterion: "Transport", first: "Extensive rail and subway networks", second: "Integrated subway and bus network" },
          { criterion: "Trip shape", first: "Clustered neighbourhood days", second: "Historic core plus district-led days" },
          { criterion: "Easy day trips", first: "Kamakura, Nikko or Hakone", second: "Suwon, Incheon or the DMZ area" },
        ]}
      />

      <ArticleSection id="cost" title="Cost and accommodation">
        <p>
          Seoul often gives travellers more room for the same accommodation budget,
          particularly away from the most popular parts of Myeongdong, Hongdae and
          Gangnam. Tokyo has an enormous range of hotels, but room size and location
          make a major difference. Business hotels near useful stations can be a
          better-value choice than a fashionable address with a long walk to rail.
        </p>
        <p>
          Everyday food can be good value in both cities. The budget gets away from
          you through specialist meals, cocktails, shopping and multiple paid
          experiences rather than basic transport or a simple lunch. Compare live
          prices in your preferred neighbourhoods; exchange rates and event dates can
          overturn a general cost comparison quickly.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Which city is better for food?">
        <Subheading>Tokyo: extraordinary range and specialisation</Subheading>
        <p>
          Tokyo’s strength is depth. Sushi, ramen, soba, tempura, yakitori, tonkatsu
          and regional Japanese cooking each have specialists at every price level.
          Tiny counters can be as memorable as formal dining rooms. Planning one
          destination meal per area avoids crossing the city simply to eat.
        </p>
        <Subheading>Seoul: social meals and late-night momentum</Subheading>
        <p>
          Seoul excels at meals that turn into evenings: barbecue, shared stews,
          fried chicken, market snacks and tables covered with banchan. Gwangjang and
          Namdaemun markets are accessible starting points, while neighbourhoods such
          as Euljiro, Mangwon and Seongsu show more contemporary sides of the city.
        </p>
        <p>
          Tokyo wins for sheer culinary range; Seoul may suit groups better because
          so many meals are designed to be shared.
        </p>
      </ArticleSection>

      <ArticleSection id="sights" title="Sights, culture and neighbourhoods">
        <p>
          Tokyo rewards contrast: Senso-ji and Asakusa, the youth culture of Harajuku
          and Shibuya, galleries in Ueno, quieter streets in Yanaka, and the small
          bars of Shinjuku. It takes longer because the interesting places are spread
          across a vast metropolitan area.
        </p>
        <p>
          Seoul places royal palaces, hanok areas, museums and modern central districts
          closer together. Gyeongbokgung, Bukchon, Insadong and Gwangjang Market can
          form one coherent day. Hongdae, Seongsu, Itaewon and Gangnam then add
          distinct contemporary days and nights.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.tokyoTemple}
        caption="Senso-ji provides a historic starting point for a day exploring Tokyo’s Asakusa neighbourhood."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Seoul has the easier edge for energetic late nights. Hongdae mixes live
          music, clubs and street culture; Euljiro and Jongno-3-ga are strong for
          food-and-drink evenings; Itaewon remains internationally minded. Tokyo’s
          nightlife is more fragmented but exceptionally varied, from tiny Golden Gai
          bars and jazz rooms to major clubs and izakaya streets.
        </p>
        <p>
          In either city, check the last train time before settling in. A late taxi
          across a large city changes the cost of the night.
        </p>
      </ArticleSection>

      <ArticleSection id="transport" title="Transport and ease of planning">
        <p>
          Both systems are extensive, clean and well signed. Tokyo’s mix of JR,
          private railways, Tokyo Metro and Toei lines looks complicated, but a
          rechargeable IC card removes much of the ticket friction. The real planning
          skill is geographical: pair nearby neighbourhoods rather than following a
          list in popularity order.
        </p>
        <p>
          Seoul’s colour-coded subway is straightforward, with buses filling the
          gaps. A transport card is useful, and the official tourism guidance notes
          multilingual station signs. Seoul is not small, but a first-time itinerary
          usually requires fewer cross-city journeys than Tokyo.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.seoulPalace}
        caption="Gyeongbokgung’s painted palace buildings bring Seoul’s royal history into a central sightseeing day."
      />

      <ArticleSection id="when-to-go" title="Best time to visit">
        <p>
          Spring and autumn bring comfortable walking weather to both cities and also
          attract strong demand. Tokyo’s cherry blossom season is beautiful but busy;
          Seoul’s palace grounds and mountain edges are especially appealing in
          autumn. Summers are hot and humid in both places, so build in indoor breaks.
          Winter is cold, clearer and often better suited to travellers who prioritise
          food, shopping and museums over long outdoor days.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Tokyo or Seoul: the verdict">
        <p>
          Tokyo is the better choice for a longer first trip built around food,
          neighbourhood discovery and almost unlimited variety. Seoul is the better
          choice for a focused four- or five-day holiday with palace history, Korean
          contemporary culture and strong nightlife. If possible, do not squeeze both
          into one week; each deserves enough time to learn its rhythm.
        </p>
        <p>
          Start with the <GuideLink slug="tokyo-travel-guide">Tokyo travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={tokyoGuide.templateSlug}>seven-day Tokyo itinerary</ItineraryLink>,
          or the <GuideLink slug="seoul-travel-guide">Seoul travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={seoulGuide.templateSlug}>five-day Seoul itinerary</ItineraryLink>.
        </p>
      </ArticleSection>

      <TripTrackCta title="Compare saved places before choosing">
        Keep a shortlist for each city, see how the places cluster on a map, and turn
        the winning shortlist into a day-by-day itinerary you can share.
      </TripTrackCta>
    </>
  );
}

export const tokyoVsSeoulArticle: TravelArticle = {
  slug: "tokyo-vs-seoul",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Tokyo vs Seoul: Which Is Better for Your Holiday?",
  description:
    "Compare Tokyo and Seoul for food, cost, attractions, nightlife, transport, accommodation, seasons and ideal trip length before choosing your holiday.",
  excerpt:
    "A like-for-like comparison of two compelling Asian capitals, with a clear answer for different travel styles.",
  primaryKeyword: "Tokyo vs Seoul",
  searchIntent: "Help travellers choose between two destinations",
  image: tokyoGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 10,
  relatedGuideSlugs: ["tokyo-travel-guide", "seoul-travel-guide"],
  sources: [
    { title: "GO TOKYO: transportation in Tokyo", url: "https://www.gotokyo.org/en/plan/getting-around/index.html" },
    { title: "GO TOKYO: best times to visit", url: "https://www.gotokyo.org/en/story/guide/best-times-to-visit/index.html" },
    { title: "Visit Seoul: about Seoul and its districts", url: "https://english.visitseoul.net/AboutSeoul" },
    { title: "Visit Seoul: transportation", url: "https://english.visitseoul.net/transportation/partners-en" },
    { title: "Visit Seoul: first-timer five-day route", url: "https://english.visitseoul.net/mvp/4nights5dayscoursefornovices/ENN034896" },
  ],
  Content,
};
