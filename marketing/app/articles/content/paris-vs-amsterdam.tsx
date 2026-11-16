import { amsterdamGuide } from "../../destinations/guides/amsterdam";
import { parisGuide } from "../../destinations/guides/paris";
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
        Paris and Amsterdam are both easy European city breaks, but they suit
        different trips. Paris is larger, grander and more demanding: its major
        museums, monuments and neighbourhoods can fill a week. Amsterdam is more
        compact and relaxed, with canals, cycling and a museum district that make a
        long weekend feel complete.
      </p>
      <p>
        This comparison uses the same criteria for both cities so you can choose on
        the things that affect the holiday: cost, food, culture, nightlife,
        transport, where you are likely to stay and how many days you need.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Paris</strong> for landmark museums, ambitious dining,
          romantic streets and a trip of four days or more. Choose
          <strong> Amsterdam</strong> for a compact weekend, canals, cycling and a
          city that is easier to explore without a strict plan.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Paris"
        secondLabel="Amsterdam"
        rows={[
          { criterion: "Ideal stay", first: "4–5 days", second: "2–4 days" },
          { criterion: "Best for", first: "Art, landmarks and food", second: "Canals, cycling and compact exploring" },
          { criterion: "Getting around", first: "Metro, RER, buses and walking", second: "Walking, trams, bikes and ferries" },
          { criterion: "Pace", first: "Big-city and itinerary-led", second: "Compact and flexible" },
          { criterion: "Budget pressure", first: "Accommodation and headline sights", second: "Central rooms and popular museums" },
        ]}
      />

      <ArticleSection id="cost" title="Which city costs less?">
        <p>
          Neither is a bargain city break. In both places, the room is likely to be
          the largest cost, especially on spring and summer weekends. Amsterdam’s
          compact centre means well-located rooms carry a premium; Paris has a much
          wider spread of neighbourhoods, so staying beside a metro station outside
          the postcard centre can give you more choice.
        </p>
        <p>
          Paris gives budget travellers more scope to mix free walks, parks and
          neighbourhood markets with one paid museum each day. Amsterdam also has
          excellent free experiences—canal walks, the ferry to Noord and markets—but
          several of its signature museums and canal activities are paid. Compare
          actual accommodation and attraction prices for your dates before treating
          either city as the cheaper option.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food and drink">
        <Subheading>Paris: the stronger all-round food trip</Subheading>
        <p>
          Paris wins if meals are the centre of your holiday. A day can move from a
          bakery breakfast to a market lunch, a neighbourhood wine bar and a proper
          bistro dinner. The range is the point: classic French cooking sits beside
          North African, West African, Middle Eastern and Asian food across the city.
        </p>
        <Subheading>Amsterdam: convivial cafés and a broad international scene</Subheading>
        <p>
          Amsterdam is better than the old clichés suggest. Look beyond the centre
          for Indonesian rijsttafel, Surinamese food, modern Dutch cooking and the
          brown cafés that give the city its unforced evening atmosphere. De Pijp,
          Oud-West and Oost are useful bases when food matters more than being beside
          Dam Square.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.parisCafe}
        caption="Leave room between Paris’s headline sights for a café stop and a slower meal."
      />

      <ArticleSection id="culture" title="Museums, sights and neighbourhoods">
        <p>
          Paris has the deeper bench. The Louvre, Musée d’Orsay, Centre Pompidou
          collection, Sainte-Chapelle, the Eiffel Tower and the city’s historic
          neighbourhoods compete for time. A first visit works best when you choose
          a few anchors and group the rest by area instead of racing between icons.
        </p>
        <p>
          Amsterdam concentrates much of its art around Museumplein, including the
          Rijksmuseum, Van Gogh Museum and Stedelijk. The Anne Frank House and the
          canal belt add a different historical layer. Its advantage is continuity:
          you can walk or cycle between major sights and still have time to explore
          Jordaan, De Pijp or Noord.
        </p>
      </ArticleSection>

      <ArticleSection id="nightlife" title="Nightlife and atmosphere">
        <p>
          Paris is best for late dinners, wine bars, live jazz and nights that change
          character by neighbourhood. Amsterdam is easier for a spontaneous night:
          brown cafés, small music venues and clubs sit within a much tighter area.
          For large electronic events and clubbing, Amsterdam has the edge; for
          variety and dining-led evenings, Paris does.
        </p>
      </ArticleSection>

      <ArticleSection id="transport" title="Which is easier to get around?">
        <p>
          Amsterdam is easier at first glance. The centre is compact, trams cover the
          main corridors and the ferries behind Centraal Station connect to Noord
          free of charge. Cycling can be rewarding, but visitors should understand
          local lane etiquette before joining busy commuter routes.
        </p>
        <p>
          Paris is much larger, but the metro, RER, buses and trams make its
          neighbourhoods manageable. Build each day around one part of the city and
          walk between nearby stops. That is more enjoyable than treating the metro
          map as a checklist.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.amsterdamCanal}
        caption="Amsterdam’s canals connect neighbourhood walks with the city’s everyday cycling culture."
      />

      <ArticleSection id="when-to-go" title="Best time to visit">
        <p>
          Late spring and early autumn are comfortable in both cities, but popular
          weekends book early. Amsterdam is especially appealing in April during
          tulip season, though that also increases demand. Paris has more indoor
          depth for a winter visit; Amsterdam’s canals and compact centre make a
          crisp winter weekend atmospheric if you pack for wind and rain.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Paris or Amsterdam: the verdict">
        <p>
          Pick Paris when you want the holiday to feel expansive and do not mind
          planning a few bookings. Pick Amsterdam when time is short and you want a
          city whose shape becomes clear within a day. If this is your first major
          European art trip, Paris is the stronger choice. If you have one free
          weekend and value ease, Amsterdam usually fits better.
        </p>
        <p>
          Continue with the <GuideLink slug="paris-travel-guide">Paris travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={parisGuide.templateSlug}>four-day Paris itinerary</ItineraryLink>,
          or use the <GuideLink slug="amsterdam-travel-guide">Amsterdam travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={amsterdamGuide.templateSlug}>three-day Amsterdam itinerary</ItineraryLink>.
        </p>
      </ArticleSection>

      <TripTrackCta title="Turn the choice into a workable itinerary">
        Save the places that persuaded you, group them into sensible days on the map,
        add your flights and share the plan with your travel companions.
      </TripTrackCta>
    </>
  );
}

export const parisVsAmsterdamArticle: TravelArticle = {
  slug: "paris-vs-amsterdam",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Paris vs Amsterdam: Which Is Better for a City Break?",
  description:
    "Compare Paris and Amsterdam for cost, food, museums, nightlife, transport, accommodation and trip length to choose the right European city break.",
  excerpt:
    "A practical, balanced comparison of two favourite European city breaks, from cost and culture to pace and ideal trip length.",
  primaryKeyword: "Paris vs Amsterdam",
  secondaryKeywords: ["Paris or Amsterdam", "European city break comparison"],
  searchIntent: "Help travellers choose between two destinations",
  image: parisGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 9,
  relatedGuideSlugs: ["paris-travel-guide", "amsterdam-travel-guide"],
  sources: [
    { title: "Paris je t’aime: planning a stay in Paris", url: "https://parisjetaime.com/eng/article/organize-your-stay-through-an-agency-a228" },
    { title: "Paris je t’aime: accommodation by neighbourhood", url: "https://parisjetaime.com/eng/article/where-to-stay-in-paris-guide-and-directory-of-accommodation-by-neighbourhood-and-arrondissement-a1964" },
    { title: "I amsterdam: neighbourhoods", url: "https://www.iamsterdam.com/en/explore/neighbourhoods" },
    { title: "I amsterdam: public transport", url: "https://www.iamsterdam.com/en/travel-stay/getting-around/public-transport-in-amsterdam" },
  ],
  Content,
};
