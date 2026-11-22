import { dubaiGuide } from "../../destinations/guides/dubai";
import { marrakechGuide } from "../../destinations/guides/marrakech";
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
        Dubai and Marrakech are both popular choices for winter sun and
        milestone trips such as 30th birthdays and luxury hen dos. Both offer
        desert adventures, souks and warm weather when the UK is grey. The
        experience, though, is very different: Dubai is ultra-modern, polished
        and built for spectacle, while Marrakech is ancient, atmospheric and
        centred on its walled medina.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Dubai</strong> for skyscrapers, beach clubs, brunches
          and five-star hotels, with guaranteed winter sunshine. Choose{" "}
          <strong>Marrakech</strong> for a shorter flight, a private riad with a
          pool, souks, hammams and the Atlas Mountains, usually at a lower cost.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Dubai"
        secondLabel="Marrakech"
        rows={[
          { criterion: "Suggested stay", first: "5 days", second: "4 days" },
          { criterion: "Flight time from UK", first: "About 7 hours", second: "About 3.5 to 4 hours" },
          { criterion: "Best fit", first: "Luxury, beach clubs and brunches", second: "Riads, souks and culture" },
          { criterion: "Desert experience", first: "Dune safari and camp dinner", second: "Agafay desert camps and quad bikes" },
          { criterion: "Best months", first: "November to March", second: "March to May, September to November" },
          { criterion: "Cost feel", first: "Can be very expensive", second: "Generally better value" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Marrakech is usually cheaper, with shorter flights and riads that can be
          booked whole for a group. Dubai has budget hotels, but its brunches,
          beach clubs and attractions add up. In Dubai, alcohol is mainly served
          in licensed hotels and venues and is expensive.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Dubai: brunch culture and global restaurants</Subheading>
        <p>
          Dubai’s famous all-inclusive brunches are a group favourite, and the
          city has restaurants from every cuisine, alongside cheap and excellent
          spots in old Dubai.
        </p>
        <Subheading>Marrakech: tagines, rooftop terraces and the night market</Subheading>
        <p>
          In Marrakech, eat at the food stalls on Jemaa el-Fnaa, have a rooftop
          lunch overlooking the souks and book a group dinner with a show.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Sights and experiences">
        <p>
          Dubai’s big hitters are the Burj Khalifa, the Dubai Fountain, the
          souks and abras of old Dubai, the Museum of the Future and the water
          parks on Palm Jumeirah.
        </p>
        <p>
          Marrakech is about atmosphere: the souks, Jemaa el-Fnaa at sunset, the
          Bahia Palace, Jardin Majorelle and a hammam, plus a day in the Atlas
          Mountains.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.dubaiMarinaBoat}
        caption="Dubai Marina’s towers line the water, close to JBR beach and plenty of bars and restaurants."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Dubai is spread out, so taxis, ride-hailing and the metro are needed to
          get between areas. In Marrakech, the medina is explored on foot; taxis
          link it to Guéliz and the airport. Agree fares or check meters before
          setting off.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Dubai, Downtown suits sightseeing, while Dubai Marina, JBR and Palm
          Jumeirah suit beach days. In Marrakech, a whole riad in the medina is
          the classic group choice, while pool villas in the Palmeraie offer more
          space.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.marrakechJemaa}
        caption="Jemaa el-Fnaa fills with food stalls, musicians and storytellers as evening falls."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Dubai has rooftop bars, beach clubs and big-name clubs, mostly inside
          hotels. Marrakech’s nightlife is quieter, centred on hotel bars,
          restaurants with entertainment and a few clubs in Hivernage.
        </p>
      </ArticleSection>

      <ArticleSection id="culture" title="Local laws and customs">
        <p>
          Both are Muslim-majority destinations. Dress modestly away from the
          beach and pool, especially in old Dubai and the medina, and be aware
          that public displays of affection and drunkenness can cause problems.
          Check FCDO advice for each country before you travel, and check dates
          for Ramadan, when daytime opening hours can change.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How long to stay">
        <p>
          Dubai’s long flight makes five days a sensible minimum. Four days is
          enough for Marrakech, including a day trip.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Dubai or Marrakech?">
        <CheckList>
          <li><strong>Choose Dubai</strong> for luxury, spectacle and guaranteed winter sun.</li>
          <li><strong>Choose Marrakech</strong> for a riad, souks and culture at a lower cost.</li>
        </CheckList>
        <p>
          See the{" "}
          <GuideLink slug="dubai-travel-guide">Dubai travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={dubaiGuide.templateSlug}>
            five-day Dubai itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="marrakech-travel-guide">Marrakech travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={marrakechGuide.templateSlug}>
            four-day Marrakech itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Keep the costs fair">
        Log the riad deposit, desert trip and brunch in one place, split each
        one between the people who joined and see who still owes what.
      </TripTrackCta>
    </>
  );
}

export const dubaiVsMarrakechArticle: TravelArticle = {
  slug: "dubai-vs-marrakech",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Dubai vs Marrakech: Which Is Better for Winter Sun With Friends?",
  description:
    "Compare Dubai and Marrakech for a group trip: flight time, cost, food, desert trips, nightlife, local customs, where to stay and the best time to go.",
  excerpt:
    "Skyscrapers and brunches, or riads and souks? How Dubai and Marrakech compare for a winter-sun group trip.",
  primaryKeyword: "Dubai vs Marrakech",
  secondaryKeywords: ["Dubai or Marrakech", "winter sun hen do", "Marrakech 30th birthday"],
  searchIntent: "Help a group choose between two winter-sun destinations",
  image: marrakechGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 7,
  relatedGuideSlugs: ["dubai-travel-guide", "marrakech-travel-guide"],
  sources: [
    { title: "Visit Dubai: official tourism site", url: "https://www.visitdubai.com/en" },
    { title: "Visit Morocco: official tourism site", url: "https://www.visitmorocco.com/en" },
    { title: "FCDO travel advice: United Arab Emirates", url: "https://www.gov.uk/foreign-travel-advice/united-arab-emirates" },
    { title: "FCDO travel advice: Morocco", url: "https://www.gov.uk/foreign-travel-advice/morocco" },
  ],
  Content,
};
