import { miamiGuide } from "../../destinations/guides/miami";
import {
  ArticleSection,
  CheckList,
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
        After years of trailers and waiting, Grand Theft Auto VI is finally out,
        and millions of players are now cruising the neon streets of Vice City,
        the game’s take on Miami, in the fictional Florida-inspired state of
        Leonida. If a few hundred hours on the sofa have you wanting the real
        thing, good news: the sunshine, Art Deco hotels, palm-lined boulevards
        and late nights are all there in Miami, no controller required.
      </p>
      <p>
        Here is how to plan a group trip to the city that inspired Vice City,
        from Ocean Drive at dusk to a swamp-boat ride in the Everglades. Leave
        the car chases and heists in the game.
      </p>

      <DecisionBox>
        <p>
          Base yourselves in <strong>South Beach</strong>, walk{" "}
          <strong>Ocean Drive</strong> when the neon comes on, spend a night in{" "}
          <strong>Wynwood</strong>, eat Cuban food in{" "}
          <strong>Little Havana</strong> and take an airboat into the{" "}
          <strong>Everglades</strong>. Four days covers it.
        </p>
      </DecisionBox>

      <ArticleSection id="ocean-drive" title="Ocean Drive: the real Vice City strip">
        <p>
          The pastel Art Deco hotels of Ocean Drive, lit up in pink, blue and
          purple neon after dark, are the look the Vice City games have always
          borrowed. Walk the stretch between 5th and 15th Street at dusk, then
          grab a drink on one of the terraces facing Lummus Park and the beach.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.miamiOceanNeon}
        caption="Ocean Drive’s Art Deco hotels glowing in neon after dark, the real-world look behind Vice City."
      />

      <ArticleSection id="beach" title="South Beach by day">
        <p>
          Spend your mornings on South Beach by the colourful lifeguard huts, rent
          bikes along the beach path or book a jet-ski or boat trip on Biscayne
          Bay for your own open-water moment.
        </p>
      </ArticleSection>

      <ArticleSection id="neighbourhoods" title="The neighbourhoods">
        <Subheading>Wynwood</Subheading>
        <p>
          Warehouse walls covered in huge murals, craft breweries and bars make
          Wynwood the best place for a group night that does not start on the
          beach. Start at the Wynwood Walls.
        </p>
        <Subheading>Little Havana</Subheading>
        <p>
          Café cubano from a ventanita window at Versailles, dominoes at Máximo
          Gómez Park and live music on Calle Ocho.
        </p>
        <Subheading>Brickell and Downtown</Subheading>
        <p>
          Rooftop bars with skyline views, for a smarter final night.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.miamiWynwoodMural}
        caption="Wynwood’s murals turn whole streets into a gallery, with bars and breweries in between."
      />

      <ArticleSection id="everglades" title="Into the swamp: the Everglades">
        <p>
          Leonida’s swamps owe a lot to the real Everglades, about an hour west
          of downtown Miami. An airboat tour skims across the sawgrass looking for
          alligators, birds and the odd turtle. Choose a licensed operator and
          follow the guide’s instructions.
        </p>
      </ArticleSection>

      <ArticleSection id="nightlife" title="Where to party">
        <p>
          Miami’s clubs, from South Beach to Downtown, run very late, especially
          at weekends. Book tables ahead if you want them, check dress codes and
          bring photo ID: the legal drinking age in the US is 21 and venues
          check everyone. Miami tour operators have also launched Vice City
          themed tours since the game’s release, if your group wants a guided
          version.
        </p>
      </ArticleSection>

      <ArticleSection id="practical" title="Practical tips">
        <CheckList>
          <li>UK visitors need an approved ESTA before flying.</li>
          <li>Visit between November and April for drier, less humid weather.</li>
          <li>Hurricane season runs from June to November; check your insurance.</li>
          <li>Use ride-hailing between neighbourhoods; Miami is spread out.</li>
          <li>Budget for tipping, typically 18 to 20% in restaurants.</li>
        </CheckList>
        <p>
          For the full plan, read the{" "}
          <GuideLink slug="miami-travel-guide">Miami travel guide</GuideLink> and
          copy the{" "}
          <ItineraryLink slug={miamiGuide.templateSlug}>
            four-day Miami itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="Plan your own Vice City run">
        Search Miami’s bars, beaches and Cuban spots on the map, save them to a
        shared trip and line up the nights with your crew.
      </TripTrackCta>
    </>
  );
}

export const partyInMiamiLikeGtaViArticle: TravelArticle = {
  slug: "party-in-miami-like-gta-vi",
  categorySlug: "travel-inspiration",
  categoryLabel: "Travel inspiration",
  title: "How to Party in Miami Like It’s GTA VI: A Real-Life Vice City Trip",
  description:
    "GTA VI is out. Here is how to plan a real-life Vice City trip to Miami with friends: Ocean Drive neon, South Beach, Wynwood, Little Havana, the Everglades and the nightlife.",
  excerpt:
    "Swap the controller for the real thing: Ocean Drive neon, Wynwood murals and an Everglades airboat on a Miami group trip.",
  primaryKeyword: "GTA 6 Miami trip",
  secondaryKeywords: ["Vice City real life", "Miami group trip", "GTA VI Miami locations"],
  searchIntent: "Plan a Miami trip inspired by GTA VI's Vice City",
  image: miamiGuide.image,
  publishedAt: "2026-11-22",
  updatedAt: "2026-11-22",
  readingMinutes: 5,
  relatedGuideSlugs: ["miami-travel-guide"],
  sources: [
    { title: "Yahoo Travel: GTA 6 is out, Miami offers real-life Vice City tours", url: "https://travel.yahoo.com/guides/articles/gta-6-today-miami-already-130015244.html" },
    { title: "Greater Miami Convention & Visitors Bureau", url: "https://www.miamiandbeaches.com/" },
    { title: "FCDO travel advice: USA", url: "https://www.gov.uk/foreign-travel-advice/usa" },
  ],
  Content,
};
