import { splitGuide } from "../../destinations/guides/split";
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
        Set-jetting, travelling to places you have seen on screen, is now one of
        the biggest drivers of where young travellers go. Expedia’s research
        found that 81% of Gen Z and millennial travellers plan holidays around
        film and TV locations. After a year of big-screen epics and period
        dramas, here are the screen-inspired trips worth planning with friends
        in 2027.
      </p>

      <DecisionBox>
        <p>
          For myth and sunshine, head to the <strong>Greek coast</strong>. For
          moody romance closer to home, go to the <strong>Yorkshire moors</strong>.
          For fantasy fans, <strong>Croatia’s Dalmatian coast</strong> still
          delivers, and Scotland’s Highlands are a hit with searches for
          “ethereal” landscapes.
        </p>
      </DecisionBox>

      <ArticleSection id="odyssey" title="Greece: the Odyssey effect">
        <p>
          Expedia’s set-jetting forecast tipped Greece’s Peloponnese to benefit
          from Christopher Nolan’s The Odyssey, and the BBC’s 2027 trend report
          highlights a wider pull towards places steeped in myth. Combine an
          ancient site such as Olympia or Mycenae with beach time on the coast,
          or island-hop to somewhere like{" "}
          <GuideLink slug="mykonos-travel-guide">Mykonos</GuideLink> with a boat
          trip to the sacred island of Delos.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.greekCoast}
        caption="Greece’s coastline of bays and mountains is the backdrop for its oldest stories."
      />

      <ArticleSection id="wuthering" title="Yorkshire: Wuthering Heights country">
        <p>
          The same forecast picked Yorkshire for Wuthering Heights. The Brontë
          sisters’ home village of Haworth, the parsonage museum and the open
          moorland around it make a brilliant cottage weekend for a group,
          with walks by day and pubs by night.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.moorland}
        caption="Open moorland of the kind that made Wuthering Heights famous."
      />

      <ArticleSection id="fantasy" title="Fantasy landscapes">
        <Subheading>Croatia’s Dalmatian coast</Subheading>
        <p>
          Split, Klis Fortress and Dubrovnik were filming locations for Game of
          Thrones, and the region remains a favourite for fantasy fans. See the{" "}
          <GuideLink slug="split-travel-guide">Split travel guide</GuideLink>.
        </p>
        <Subheading>The Scottish Highlands</Subheading>
        <p>
          The BBC reports searches for a “Scotland Highland aesthetic” are up
          sharply. Glencoe, Skye and the Glenfinnan Viaduct are classic stops.
        </p>
      </ArticleSection>

      <ArticleSection id="tips" title="Tips for a set-jetting trip">
        <CheckList>
          <li>Check which locations are open to visitors; some are on private land.</li>
          <li>Visit early or late to avoid tour groups.</li>
          <li>Rewatch together before you go, or after.</li>
          <li>Pair filming spots with local food and walks, not just photos.</li>
        </CheckList>
      </ArticleSection>

      <TripTrackCta title="Map your filming locations">
        Search each location on the map, save it to a shared trip and let the
        optimiser suggest a sensible order for the day.
      </TripTrackCta>
    </>
  );
}

export const setJetting2027Article: TravelArticle = {
  slug: "set-jetting-2027",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "Set-Jetting 2027: Trips Inspired by The Odyssey, Wuthering Heights and More",
  description:
    "Set-jetting trips for 2027: Greece for The Odyssey, Yorkshire for Wuthering Heights and fantasy landscapes in Croatia and Scotland, with tips for group trips.",
  excerpt:
    "Where screen hits are sending travellers in 2027, from the Greek coast to the Yorkshire moors.",
  primaryKeyword: "set-jetting 2027",
  secondaryKeywords: ["film locations travel", "The Odyssey filming locations", "Wuthering Heights Yorkshire"],
  searchIntent: "Find film- and TV-inspired trips for 2027",
  image: splitGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 4,
  relatedGuideSlugs: ["split-travel-guide", "mykonos-travel-guide"],
  sources: [
    { title: "Expedia: set-jetting predictions for 2026", url: "https://www.expedia.com/newsroom/expedia-predicts-set-jetting-surge-in-2026/" },
    { title: "BBC Travel: Seven travel trends that will define 2027", url: "https://www.bbc.com/travel/article/20261111-seven-travel-trends-that-will-define-2027" },
    { title: "Visit Greece: official tourism site", url: "https://www.visitgreece.gr/" },
  ],
  Content,
};
