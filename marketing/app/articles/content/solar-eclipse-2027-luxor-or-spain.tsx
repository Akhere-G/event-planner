import {
  ArticleSection,
  CheckList,
  ComparisonTable,
  DecisionBox,
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
        On 2 August 2027, a total solar eclipse will sweep across southern
        Spain, Gibraltar, North Africa and Egypt. Near Luxor, totality will last
        more than six minutes, one of the longest totalities visible from land
        this century. For a group of friends, it is a rare chance to build a trip
        around a few unforgettable minutes of darkness at midday.
      </p>
      <p>
        The two most practical choices from the UK are southern Spain, a short
        flight away, and Luxor in Egypt, where totality lasts longest and clear
        skies are very likely. Here is how they compare.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Luxor</strong> for the longest totality and the best
          odds of clear skies, combined with temples and the Nile. Choose{" "}
          <strong>southern Spain</strong> for a shorter, cheaper trip with more
          accommodation, beaches and tapas, with a shorter but still dramatic
          totality. Book either well in advance.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Luxor"
        secondLabel="Southern Spain"
        rows={[
          { criterion: "Totality", first: "More than 6 minutes", second: "Shorter, varying by location" },
          { criterion: "Weather odds", first: "Very likely clear skies", second: "Good, but less certain" },
          { criterion: "Heat", first: "Extremely hot in August", second: "Hot, especially inland" },
          { criterion: "Flight from UK", first: "About 5 hours", second: "About 2.5 hours" },
          { criterion: "Accommodation", first: "Limited near the path", second: "More choice along the coast" },
          { criterion: "Add-ons", first: "Valley of the Kings, Nile cruise", second: "Seville, Cádiz, beaches" },
        ]}
      />

      <ArticleSection id="luxor" title="Luxor: the longest totality">
        <p>
          Luxor sits close to the centre line of the eclipse path, and its
          desert climate makes clear skies very likely. Pair eclipse day with the
          temples of Karnak and Luxor, the tombs of the Valley of the Kings and a
          Nile cruise. August is extremely hot, so plan sightseeing early and
          late in the day.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.luxorValleyKings}
        caption="Painted tombs in the Valley of the Kings, across the Nile from Luxor."
      />

      <ArticleSection id="spain" title="Southern Spain: the easy option">
        <p>
          The path crosses Andalusia, including areas near Cádiz and Málaga.
          Totality is shorter than in Egypt, but flights are short and cheap, and
          there is far more accommodation. Combine the eclipse with Seville,
          Cádiz or a few days on the beach.
        </p>
        <Subheading>Check the path carefully</Subheading>
        <p>
          Only places inside the narrow path of totality see the full eclipse.
          Use an official eclipse map to check your exact location before you
          book, as a few kilometres can make a big difference.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.sevillePlazaEspana}
        caption="Seville’s Plaza de España. Andalusia makes a good base for an eclipse trip combined with a city break."
      />

      <ArticleSection id="safety" title="Watching safely">
        <CheckList>
          <li>Use certified eclipse glasses for every partial phase.</li>
          <li>Only remove them during totality itself.</li>
          <li>Never look at the sun through a camera, binoculars or telescope without a proper solar filter.</li>
          <li>Drink plenty of water and find shade: it will be very hot.</li>
        </CheckList>
      </ArticleSection>

      <ArticleSection id="booking" title="When to book">
        <p>
          Now. Hotels near the path, especially in Luxor and on Nile cruises, are
          already in high demand. Choose flexible bookings where you can, and
          agree as a group who is booking what.
        </p>
      </ArticleSection>

      <TripTrackCta title="Plan around the main event">
        Pin eclipse day to your shared calendar, then build the temples, beaches
        or tapas bars around it with your group.
      </TripTrackCta>
    </>
  );
}

export const solarEclipse2027LuxorOrSpainArticle: TravelArticle = {
  slug: "solar-eclipse-2027-luxor-or-spain",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "Solar Eclipse 2027: Luxor or Southern Spain for Your Group?",
  description:
    "Where to watch the 2 August 2027 total solar eclipse: Luxor or southern Spain? Compare totality, weather, heat, flights, accommodation and safety tips.",
  excerpt:
    "More than six minutes of totality in Luxor, or a shorter, easier trip to Andalusia? How to choose for the August 2027 eclipse.",
  primaryKeyword: "solar eclipse 2027",
  secondaryKeywords: ["eclipse 2027 Spain", "eclipse 2027 Luxor", "where to watch eclipse 2027"],
  searchIntent: "Choose where to watch the 2027 total solar eclipse",
  image: articlePhotos.eclipseDiamondRing,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 5,
  relatedGuideSlugs: [],
  sources: [
    { title: "NASA: eclipses and transits", url: "https://science.nasa.gov/eclipses/" },
    { title: "Tripmojo: upcoming events in 2027", url: "https://tripmojo.ai/blog/upcoming-events-in-2027-worth-planning-a-trip-around" },
    { title: "FCDO travel advice: Egypt", url: "https://www.gov.uk/foreign-travel-advice/egypt" },
    { title: "FCDO travel advice: Spain", url: "https://www.gov.uk/foreign-travel-advice/spain" },
  ],
  Content,
};
