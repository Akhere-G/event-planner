import { mykonosGuide } from "../../destinations/guides/mykonos";
import { splitGuide } from "../../destinations/guides/split";
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
        Split and Mykonos are both gateways to summer island life, but they
        start from different places. Split is a real city built inside a Roman
        palace, with ferries and speedboats fanning out to Hvar, Brač and Vis.
        Mykonos is a small island where beach clubs, whitewashed lanes and
        sunset bars are the main event.
      </p>
      <p>
        Groups often weigh them up as “Croatia or Greece”. The right answer
        depends on whether you want a city base with island-hopping or a single
        island with a famous party reputation.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Split</strong> for better value, a lively historic city
          and boat days to the islands, including Hvar’s party scene. Choose{" "}
          <strong>Mykonos</strong> for glamorous beach clubs, sunset drinks in
          Little Venice and a compact island where everything is close, if the
          budget can stretch.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Split"
        secondLabel="Mykonos"
        rows={[
          { criterion: "Suggested stay", first: "4 days", second: "3–4 days" },
          { criterion: "Best fit", first: "City, sea and island-hopping", second: "Beach clubs and a glamorous weekend" },
          { criterion: "Cost feel", first: "Usually better value", second: "Expensive in peak season" },
          { criterion: "Beaches", first: "City beaches and island boat trips", second: "Sandy south-coast beaches" },
          { criterion: "Big day out", first: "Blue Cave, Vis and Hvar", second: "Ancient Delos" },
          { criterion: "Season", first: "May to October", second: "June to September" },
        ]}
      />

      <ArticleSection id="cost" title="Cost">
        <p>
          Split usually costs less day to day, with self-catering apartments
          common for groups and plenty of mid-priced restaurants. Mykonos has a
          reputation for high prices, especially for beach-club beds and dinners.
          Boat trips from Split add up, so budget for one or two big days on the
          water.
        </p>
      </ArticleSection>

      <ArticleSection id="food" title="Food">
        <Subheading>Split: Dalmatian seafood and wine</Subheading>
        <p>
          Expect grilled fish, black risotto and local wines, from cheap canteens
          like Buffet Fife to busy group-friendly spots in the old town.
        </p>
        <Subheading>Mykonos: tavernas and beach lunches</Subheading>
        <p>
          Mykonos is great for long lunches on the beach and simple fish tavernas
          in town, with famous splurges such as Nammos on Psarou.
        </p>
      </ArticleSection>

      <ArticleSection id="attractions" title="Sights and days out">
        <p>
          Split’s Diocletian’s Palace is a lived-in Roman monument, and Marjan
          Hill gives sunset views over the city. The big draw is the sea: boat
          trips to the Blue Cave and Vis, or a catamaran to Hvar.
        </p>
        <p>
          Mykonos has Little Venice, the windmills and the sacred island of
          Delos, plus beaches for every mood.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.splitRiva}
        caption="Split’s waterfront promenade is where evenings start, with the old town behind and boats in front."
      />

      <ArticleSection id="transport" title="Getting around">
        <p>
          Split’s old town is walkable, and the ferry port is right next to it.
          Mykonos relies on buses, sea taxis and hire vehicles, which are fine for
          a small island but can get busy in July and August.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <p>
          In Split, stay in or near the old town or in Varoš for walkable
          evenings, and check stairs and bar noise. On Mykonos, choose Mykonos
          Town for nightlife or Ornos and Psarou for beach days.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.mykonosOrnos}
        caption="Ornos is one of Mykonos’s sheltered south-coast bays, handy for a beach day close to town."
      />

      <ArticleSection id="nightlife" title="Nightlife">
        <p>
          Split has lively bars in the old town and on Bačvice beach, while
          Hvar, an easy boat ride away, is one of the Adriatic’s best-known party
          spots. Mykonos combines beach clubs on the south coast with bars in
          town that run late.
        </p>
      </ArticleSection>

      <ArticleSection id="weather" title="When to go">
        <p>
          June and September are ideal for both, with warm seas and fewer crowds
          than peak summer. Island boat trips from Split and many Mykonos beach
          clubs run only in the main season.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How long to stay">
        <p>
          Four days in Split covers the city, a boat trip and Hvar. Three or four
          days suits Mykonos, or add another Greek island by ferry.
        </p>
      </ArticleSection>

      <ArticleSection id="verdict" title="Split or Mykonos?">
        <CheckList>
          <li><strong>Choose Split</strong> for value, history and island-hopping.</li>
          <li><strong>Choose Mykonos</strong> for glamour and beach clubs in one place.</li>
        </CheckList>
        <p>
          Explore the{" "}
          <GuideLink slug="split-travel-guide">Split travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={splitGuide.templateSlug}>
            four-day Split itinerary
          </ItineraryLink>
          , or the{" "}
          <GuideLink slug="mykonos-travel-guide">Mykonos travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={mykonosGuide.templateSlug}>
            four-day Mykonos itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Map out the boat days">
        Put ferries, boat trips and beach days on one shared plan so the group
        can see the whole trip, then split boat and apartment costs fairly.
      </TripTrackCta>
    </>
  );
}

export const splitVsMykonosArticle: TravelArticle = {
  slug: "split-vs-mykonos",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Split vs Mykonos: Croatia or Greece for Your Group Trip?",
  description:
    "Compare Split and Mykonos for group holidays: cost, beaches and boat trips, nightlife, food, getting around, where to stay and the best time to go.",
  excerpt:
    "A Roman city with island boat trips, or a glamorous island of beach clubs? How Split and Mykonos compare.",
  primaryKeyword: "Split vs Mykonos",
  secondaryKeywords: ["Croatia or Greece", "Split or Mykonos", "Croatia vs Greece group holiday"],
  searchIntent: "Help a group choose between Croatia and Greece",
  image: splitGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["split-travel-guide", "mykonos-travel-guide"],
  sources: [
    { title: "Croatian National Tourist Board", url: "https://croatia.hr/en-gb" },
    { title: "Visit Greece: official tourism site", url: "https://www.visitgreece.gr/" },
    { title: "FCDO travel advice: Croatia", url: "https://www.gov.uk/foreign-travel-advice/croatia" },
    { title: "FCDO travel advice: Greece", url: "https://www.gov.uk/foreign-travel-advice/greece" },
  ],
  Content,
};
