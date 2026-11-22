import {
  ArticleSection,
  CheckList,
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
        Eurovision 2027 is heading to the Black Sea. The European Broadcasting
        Union and Bulgarian National Television have chosen Burgas to host the
        71st Eurovision Song Contest at Arena Burgas, with three live shows on
        Tuesday 11 May, Thursday 13 May and Saturday 15 May 2027. Songs from 36
        countries are due to compete.
      </p>
      <p>
        For a group of fans, Burgas is an unusual host: a seaside city rather
        than a capital, with beaches, a long seafront park and lower prices than
        many recent host cities. Here is how to plan a Eurovision week there.
      </p>

      <DecisionBox>
        <p>
          Register for ticket news on the official Eurovision site, book
          refundable accommodation as early as you can, and plan to enjoy the
          fan zones and the coast even if you don’t get arena tickets. The
          semi-finals are usually easier to get into than the Saturday final.
        </p>
      </DecisionBox>

      <ArticleSection id="tickets" title="Tickets">
        <p>
          Eurovision tickets are released in batches and sell out quickly.
          Follow the official channels for sale dates, and only buy from
          authorised sellers. Shows include jury and family rehearsals as well as
          the live broadcasts, which gives a group more chances to get in.
        </p>
      </ArticleSection>

      <ArticleSection id="stay" title="Where to stay">
        <p>
          Hotels in central Burgas will fill quickly. Consider apartments for a
          group, or nearby resorts on the coast such as Sunny Beach or Pomorie,
          and check transport back to the city late at night.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.burgasFlags}
        caption="Flags will be everywhere in Burgas during Eurovision week in May 2027."
      />

      <ArticleSection id="beyond" title="Beyond the arena">
        <Subheading>The Sea Garden</Subheading>
        <p>
          Burgas’s long seafront park runs along the beach and is the natural
          place for fans to gather between shows.
        </p>
        <Subheading>Nessebar and Sozopol</Subheading>
        <p>
          Two pretty old towns on peninsulas along the coast, both an easy day
          trip from the city.
        </p>
        <Subheading>The Black Sea coast</Subheading>
        <p>
          In mid-May, the beaches are quiet and the weather is usually mild,
          though the sea may still be cool for swimming.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.blackSeaCoast}
        caption="Bulgaria’s Black Sea coast is quiet and green in May, a good place to recover between shows."
      />

      <ArticleSection id="getting-there" title="Getting there">
        <p>
          Burgas has its own airport, and Sofia is a longer journey across the
          country by road or rail. Check direct flights from the UK early, as
          capacity will be tight around the contest.
        </p>
      </ArticleSection>

      <ArticleSection id="checklist" title="Eurovision group checklist">
        <CheckList>
          <li>Agree a budget and who is trying for tickets.</li>
          <li>Book refundable rooms now.</li>
          <li>Plan a watch party for any show you are not attending.</li>
          <li>Pack flags, layers for cool evenings and comfortable shoes.</li>
          <li>Keep shared costs in one place so the group can settle up after.</li>
        </CheckList>
      </ArticleSection>

      <TripTrackCta title="Your Eurovision week, in one plan">
        Add the shows, watch parties and day trips to a shared trip and see who
        owes what for tickets and rooms.
      </TripTrackCta>
    </>
  );
}

export const eurovision2027BurgasGroupTripArticle: TravelArticle = {
  slug: "eurovision-2027-burgas-group-trip",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "Eurovision 2027 in Burgas: How to Plan a Group Trip",
  description:
    "Eurovision 2027 is in Burgas, Bulgaria, on 11, 13 and 15 May. How to plan a group trip: tickets, where to stay, things to do on the Black Sea coast and getting there.",
  excerpt:
    "Bulgaria’s Black Sea city of Burgas hosts Eurovision in May 2027. Here is how to plan a fan trip with friends.",
  primaryKeyword: "Eurovision 2027 Burgas",
  secondaryKeywords: ["Eurovision 2027 tickets", "Eurovision 2027 dates", "Burgas Bulgaria travel"],
  searchIntent: "Plan a trip to Eurovision 2027 in Burgas",
  image: articlePhotos.burgasPanorama,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 4,
  relatedGuideSlugs: [],
  sources: [
    { title: "Eurovision: Burgas to host the 71st Eurovision Song Contest", url: "https://www.eurovision.com/stories/burgas-to-host-71st-eurovision-bulgaria-2027/" },
    { title: "Eurovision: Burgas 2027", url: "https://www.eurovision.com/eurovision-song-contest/burgas-2027/" },
    { title: "FCDO travel advice: Bulgaria", url: "https://www.gov.uk/foreign-travel-advice/bulgaria" },
  ],
  Content,
};
