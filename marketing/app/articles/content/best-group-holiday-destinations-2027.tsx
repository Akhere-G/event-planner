import { mykonosGuide } from "../../destinations/guides/mykonos";
import {
  ArticleSection,
  CheckList,
  DecisionBox,
  GuideLink,
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
        Planning a trip for a group is a different job from planning one for
        yourself. The destination has to work for a range of budgets, be easy to
        reach from different UK airports and offer enough to do that nobody
        spends the week bored or broke. These are our picks for group holidays in
        2027, chosen with those practical tests in mind and with an eye on what
        is trending for the year ahead.
      </p>

      <DecisionBox>
        <p>
          For a long weekend, look at <strong>Kraków</strong>,{" "}
          <strong>Marbella</strong> or <strong>Split</strong>. For a week in the
          sun, try <strong>Mykonos</strong>, <strong>Tenerife</strong> or the{" "}
          <strong>Albanian Riviera</strong>. For a bucket-list trip, choose
          between <strong>Tulum</strong>, <strong>Phuket</strong> and{" "}
          <strong>Las Vegas</strong>.
        </p>
      </DecisionBox>

      <ArticleSection id="trends" title="What is shaping group travel in 2027">
        <p>
          Travel trend reports for 2027 point in a few clear directions. BBC
          Travel highlights “un-adulting” trips built around carefree fun (citing
          Expedia research in which 71% of Gen Z and millennial travellers
          surveyed said they were likely to book one) and a new kind of boys’
          trip that mixes activities with time together. Skyscanner’s UK report names a “Sten Do Surge” of joint
          stag and hen celebrations and “Currency Chasers” looking for places
          where the pound goes further. Short, one-night “trip snacking” breaks
          are rising too.
        </p>
        <p>
          The common thread is shared experiences rather than ticking off sights,
          which suits group trips perfectly.
        </p>
      </ArticleSection>

      <ArticleSection id="weekends" title="Best for a long weekend">
        <Subheading>Kraków, Poland</Subheading>
        <p>
          Great value, a beautiful old town and cellar bars within walking
          distance of each other. Read the{" "}
          <GuideLink slug="krakow-travel-guide">Kraków travel guide</GuideLink>.
        </p>
        <Subheading>Marbella, Spain</Subheading>
        <p>
          Easy flights into Málaga, beach clubs, smart dinners and a pretty old
          town for hen dos and birthdays. See the{" "}
          <GuideLink slug="marbella-travel-guide">Marbella travel guide</GuideLink>.
        </p>
        <Subheading>Split, Croatia</Subheading>
        <p>
          A Roman palace city with boat trips to the islands and Hvar’s bars a
          catamaran ride away. Read the{" "}
          <GuideLink slug="split-travel-guide">Split travel guide</GuideLink>.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.friendsOnWall}
        caption="The best group trips are the ones where everyone gets at least one day they chose."
      />

      <ArticleSection id="week" title="Best for a week in the sun">
        <Subheading>Mykonos, Greece</Subheading>
        <p>
          Beach clubs, sunset drinks and a walkable white town, with Delos a short
          boat ride away. See the{" "}
          <GuideLink slug="mykonos-travel-guide">Mykonos travel guide</GuideLink>.
        </p>
        <Subheading>Tenerife, Spain</Subheading>
        <p>
          Sunshine all year, lively resorts in the south and Mount Teide for an
          adventure day. Read the{" "}
          <GuideLink slug="tenerife-travel-guide">Tenerife travel guide</GuideLink>.
        </p>
        <Subheading>The Albanian Riviera</Subheading>
        <p>
          Clear water and good-value beach towns such as Ksamil and Himarë have
          made Albania one of Europe’s most talked-about beach destinations. It is
          less polished than Greece or Spain, so check transfers and
          accommodation carefully.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.albaniaBeach}
        caption="Albania’s beaches have clear water and lower prices than many Mediterranean favourites."
      />

      <ArticleSection id="bucket-list" title="Best for a bucket-list trip">
        <Subheading>Tulum, Mexico</Subheading>
        <p>
          Maya ruins, cenotes and beach clubs on the Caribbean. Read the{" "}
          <GuideLink slug="tulum-travel-guide">Tulum travel guide</GuideLink>.
        </p>
        <Subheading>Phuket, Thailand</Subheading>
        <p>
          Boat trips to the Phi Phi islands, beaches and a big night in Patong.
          See the{" "}
          <GuideLink slug="phuket-travel-guide">Phuket travel guide</GuideLink>.
        </p>
        <Subheading>Las Vegas, USA</Subheading>
        <p>
          Pool parties, shows and the Grand Canyon for a milestone birthday. Read
          the{" "}
          <GuideLink slug="las-vegas-travel-guide">Las Vegas travel guide</GuideLink>.
        </p>
      </ArticleSection>

      <ArticleSection id="choosing" title="How to choose with your group">
        <CheckList>
          <li>Agree a budget range before anyone suggests a destination.</li>
          <li>Check flights from everyone’s nearest airport, not just one.</li>
          <li>Shortlist three places and let everyone vote.</li>
          <li>Plan one big shared day and leave room for smaller groups to split off.</li>
          <li>Decide how costs will be split before the first deposit is paid.</li>
        </CheckList>
      </ArticleSection>

      <TripTrackCta title="Shortlist, vote, plan">
        Add your shortlist to a shared wishlist, let the group vote and turn the
        winner into a day-by-day itinerary everyone can see.
      </TripTrackCta>
    </>
  );
}

export const bestGroupHolidayDestinations2027Article: TravelArticle = {
  slug: "best-group-holiday-destinations-2027",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "Best Group Holiday Destinations for 2027",
  description:
    "The best group holiday destinations for 2027, from long weekends in Kraków and Marbella to bucket-list trips to Tulum, Phuket and Las Vegas, plus the year's travel trends.",
  excerpt:
    "Where to go with your friends in 2027, based on what works for groups and what the year's trend reports say.",
  primaryKeyword: "best group holiday destinations 2027",
  secondaryKeywords: ["where to go in 2027", "best destinations 2027", "group holiday ideas"],
  searchIntent: "Find a destination for a group holiday in 2027",
  image: mykonosGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 6,
  relatedGuideSlugs: ["krakow-travel-guide", "mykonos-travel-guide", "tulum-travel-guide"],
  sources: [
    { title: "BBC Travel: Seven travel trends that will define 2027", url: "https://www.bbc.com/travel/article/20261111-seven-travel-trends-that-will-define-2027" },
    { title: "Skyscanner: UK Travel Trends 2027", url: "https://www.skyscanner.net/travel-trends" },
    { title: "FCDO travel advice: Albania", url: "https://www.gov.uk/foreign-travel-advice/albania" },
  ],
  Content,
};
