import { bangkokGuide } from "../../destinations/guides/bangkok";
import { hanoiGuide } from "../../destinations/guides/hanoi";
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
        Bangkok and Hanoi both make food a good reason to get out of bed, but
        they produce very different holidays. Bangkok spreads royal temples,
        markets, shopping districts and evening plans across a vast city. Hanoi
        concentrates much of a first visit around the Old Quarter and Hoan Kiem
        Lake, with coffee stops and short walks between the bigger sights.
      </p>
      <p>
        The choice depends on what you want from those days. Use this comparison
        to weigh the practical differences before booking, especially where to
        base yourself and how much travel you want to fit between meals.
      </p>

      <DecisionBox>
        <p>
          Choose <strong>Bangkok</strong> for ornate temples, river journeys,
          shopping and a wider range of nights out. Choose{" "}
          <strong>Hanoi</strong> for a compact historic centre, northern
          Vietnamese food, coffee culture and unhurried neighbourhood exploring.
          Allow three or four full days for either; Bangkok has more scope to
          fill a longer city stay.
        </p>
      </DecisionBox>

      <ComparisonTable
        firstLabel="Bangkok"
        secondLabel="Hanoi"
        rows={[
          {
            criterion: "Suggested first stay",
            first: "4 full days",
            second: "3–4 full days",
          },
          {
            criterion: "Best fit",
            first: "Temples, shopping and varied evenings",
            second: "Old streets, coffee and a focused food trip",
          },
          {
            criterion: "Transport",
            first: "BTS, MRT, river boats and taxis",
            second: "Walking in the centre; taxis or app rides further out",
          },
          {
            criterion: "Food focus",
            first: "Thai dishes and Chinatown eating",
            second: "Phở, bún chả, chả cá and egg coffee",
          },
          {
            criterion: "Where to start",
            first: "Choose between historic sights and rail access",
            second: "Old Quarter or the Hoan Kiem area",
          },
          {
            criterion: "Weather difference",
            first: "Warm throughout the year",
            second: "Cool winters as well as hot, humid summers",
          },
        ]}
      />

      <ArticleSection id="cost" title="Cost: compare the whole holiday">
        <p>
          Hanoi is a good starting point for a budget centred on local food,
          simple accommodation and walking. Bangkok can also work on a modest
          budget, but the range of hotels, rooftop drinks, shopping and paid
          experiences makes it easy to spend much more. That is a difference in
          how you might travel, rather than a reliable promise that every Hanoi
          trip costs less.
        </p>
        <p>
          Compare the same basket for your dates: return flights including
          baggage, four nights in a room you would actually book, airport
          transfers, meals and your chosen activities. An airfare difference can
          outweigh small daily savings. For Bangkok, include the cost of
          travelling between districts; for Hanoi, add any excursions outside
          the city separately. Exchange rates and room availability make a fixed
          daily figure misleading without dates.
        </p>
      </ArticleSection>

      <ArticleSection
        id="food"
        title="Food: breadth in Bangkok or a deeper dive in Hanoi?"
      >
        <Subheading>
          Bangkok: make each district a different food outing
        </Subheading>
        <p>
          Bangkok suits travellers who like a lot of choice. Alternate Thai
          meals with an evening exploring Yaowarat, where Chinatown’s stalls and
          shops make eating part of the street scene. Plan a food area rather
          than a single famous queue: several nearby options let you change
          course when a stall is closed or a wait becomes impractical.
        </p>
        <Subheading>
          Hanoi: build the day around northern Vietnamese dishes
        </Subheading>
        <p>
          Hanoi rewards a more focused food list: phở, grilled pork with noodles
          in bún chả, turmeric fish in chả cá, and egg coffee between walks. The
          Old Quarter makes it easy to try several small stops without crossing
          the city. Choose Hanoi if learning a few dishes in depth sounds more
          appealing than moving between very different dining districts.
        </p>
      </ArticleSection>

      <ArticleSection
        id="attractions"
        title="Attractions and the shape of a sightseeing day"
      >
        <p>
          In Bangkok, build a historic day around the Grand Palace and Wat Pho,
          with Wat Arun across the river. Keep this separate from a day of
          shopping and exploring the modern centre. The temples, river and
          markets provide strong contrasts, but combining too many districts
          creates long transfers.
        </p>
        <p>
          In Hanoi, start around Hoan Kiem Lake and the Old Quarter, then give
          the Temple of Literature and a museum their own space in the plan. The
          Vietnamese Women’s Museum and Museum of Ethnology offer different ways
          into the country’s history and communities. Check opening days before
          arranging the route, particularly for a short visit.
        </p>
        <p>
          Our editorial choice is Bangkok for variety and spectacular temple
          architecture, Hanoi for a centre you can return to repeatedly and
          learn through smaller details.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.bangkokWatArun}
        caption="Wat Arun faces the Chao Phraya, bringing Bangkok’s temple visits and river journeys into the same day."
      />

      <ArticleSection
        id="transport"
        title="Transport: Bangkok’s network versus Hanoi’s compact core"
      >
        <p>
          Bangkok’s BTS and MRT are useful for linking districts, while river
          boats serve another part of the city. Choose accommodation with the
          journeys you will make in mind: a room described as central can still
          be inconvenient for your itinerary. Use official route maps, check the
          relevant pier and service, and allow time for the walk at either end.
        </p>
        <p>
          Hanoi’s Old Quarter and lake are practical to explore on foot,
          although traffic and occupied pavements can make walking demanding.
          For sights further out, taxis or app-booked cars are useful. Vietnam
          Tourism recommends established taxi operators or ride-hailing apps;
          check the vehicle details and destination before setting off. Budget
          time for the airport transfer in either city instead of filling
          departure day with distant sights.
        </p>
      </ArticleSection>

      <ArticleSection id="accommodation" title="Where to stay">
        <Subheading>Bangkok: choose a transport advantage</Subheading>
        <p>
          For a first visit mixing shopping, meals and modern districts, compare
          hotels within an easy walk of a BTS or MRT station. A riverside base
          suits a temple-focused trip if the boat connections work for you. An
          Old Town base reduces some sightseeing journeys but will not put every
          evening destination nearby. Map your top five places before choosing
          the room.
        </p>
        <Subheading>Hanoi: choose your preferred level of bustle</Subheading>
        <p>
          The Old Quarter is convenient for food and wandering, but check recent
          reviews for street noise and room windows. Around Hoan Kiem Lake is a
          useful search area for a short visit. A West Lake base may suit a
          longer stay, provided you are happy to travel back to the historic
          centre. Compare the exact street and room, as well as the
          neighbourhood name.
        </p>
      </ArticleSection>

      <ArticlePhoto
        image={articlePhotos.hanoiLake}
        caption="Hoan Kiem Lake gives a Hanoi itinerary a natural meeting point and a pause between Old Quarter walks."
      />

      <ArticleSection id="nightlife" title="Nightlife and evenings">
        <p>
          Choose Bangkok if a varied night out is a major reason for travelling.
          You can build different evenings around Chinatown food, a bar with a
          view or a livelier entertainment area. Choose the area deliberately
          and include the journey home in the budget.
        </p>
        <p>
          Hanoi is a good fit for evenings built around food, a café, a
          water-puppet performance or bia hơi around Ta Hien and Luong Ngoc
          Quyen. These are different ways to finish a day rather than reasons to
          rush through one. Check current performance times and venue hours
          before committing to a plan.
        </p>
      </ArticleSection>

      <ArticleSection
        id="weather"
        title="Best time to visit: the seasons do not match exactly"
      >
        <p>
          Bangkok stays warm throughout the year. Roughly November to February
          is a useful starting window for planning a visit, while the hottest
          months and rainy season call for shorter outdoor stretches and
          flexible plans. Heavy rain can affect road journeys, so check
          conditions before transfers.
        </p>
        <p>
          Hanoi has a more noticeable winter. Vietnam Tourism describes
          September to November as cooler and generally sunny, summer as hot and
          rainy, and late December to March as potentially cold and misty. For a
          November trip, both cities are worth considering; for January, do not
          assume Hanoi offers the same warm evenings as Bangkok. Pack for the
          forecast in each city.
        </p>
      </ArticleSection>

      <ArticleSection id="trip-length" title="How many days should you allow?">
        <p>
          We suggest four full days in Bangkok to separate the historic river
          area, Chinatown, the modern centre and a more flexible neighbourhood
          day. Three or four full days in Hanoi allow time for the Old Quarter,
          lake, major cultural sights and repeated food stops. These are
          planning recommendations, not a claim that every traveller needs the
          same length of stay.
        </p>
        <p>
          If you want to add Ha Long Bay or Ninh Binh from Hanoi, allocate extra
          time and compare the actual transfer arrangements. If you have only a
          week, choosing one city with breathing room is usually more rewarding
          than losing another day to an international transfer. For a longer
          trip covering both, count travel days separately from sightseeing
          days.
        </p>
      </ArticleSection>

      <ArticleSection
        id="verdict"
        title="Bangkok or Hanoi: which should you choose?"
      >
        <CheckList>
          <li>
            <strong>Choose Bangkok</strong> if temples, shopping, rail travel
            and varied nights out lead your list.
          </li>
          <li>
            <strong>Choose Hanoi</strong> if coffee, northern Vietnamese food
            and a compact historic centre are the main attraction.
          </li>
          <li>
            <strong>Compare actual dates</strong> if cost or weather is the
            deciding factor; neither follows a single year-round rule.
          </li>
        </CheckList>
        <p>
          Turn the choice into a plan with the{" "}
          <GuideLink slug="bangkok-travel-guide">
            Bangkok travel guide
          </GuideLink>
          {" and "}
          <ItineraryLink slug={bangkokGuide.templateSlug}>
            four-day Bangkok itinerary
          </ItineraryLink>
          , or explore the{" "}
          <GuideLink slug="hanoi-travel-guide">Hanoi travel guide</GuideLink>
          {" and "}
          <ItineraryLink slug={hanoiGuide.templateSlug}>
            four-day Hanoi itinerary
          </ItineraryLink>
          .
        </p>
      </ArticleSection>

      <TripTrackCta title="See how your shortlist fits into four days">
        Save the places you want to visit, group activities on the map and add
        your flights. Share the itinerary with your travel companions before
        booking the details together.
      </TripTrackCta>
    </>
  );
}

export const bangkokVsHanoiArticle: TravelArticle = {
  slug: "bangkok-vs-hanoi",
  categorySlug: "destination-comparisons",
  categoryLabel: "Destination comparison",
  title: "Bangkok vs Hanoi: Which Should You Visit?",
  description:
    "Compare Bangkok and Hanoi for food, costs, attractions, nightlife, transport, accommodation, weather and trip length to choose the right holiday.",
  excerpt:
    "Temples and river journeys or Old Quarter walks and coffee? Compare the details that shape a holiday in Bangkok or Hanoi.",
  primaryKeyword: "Bangkok vs Hanoi",
  searchIntent: "Help travellers choose between two destinations",
  image: hanoiGuide.image,
  publishedAt: "2026-11-16",
  updatedAt: "2026-11-16",
  readingMinutes: 9,
  relatedGuideSlugs: ["bangkok-travel-guide", "hanoi-travel-guide"],
  sources: [
    {
      title: "Tourism Authority of Thailand: Bangkok highlights",
      url: "https://www.tourismthailand.org/Destinations/Provinces/Bangkok/219",
    },
    {
      title: "Tourism Authority of Thailand: Bangkok’s Chinatown",
      url: "https://www.tourismthailand.org/Articles/the-adventure-through-bangkok-s-chinatown",
    },
    {
      title: "BTS Skytrain: routes and fares",
      url: "https://www.bts.co.th/eng/routemap.html",
    },
    {
      title: "Chao Phraya Express Boat: routes and timetables",
      url: "https://www.chaophrayaexpressboat.com/chaophrayaexpressboat",
    },
    {
      title: "Vietnam Tourism: explore Hanoi’s Old Quarter",
      url: "https://vietnam.travel/things-to-do/explore-old-quarter-your-way/",
    },
    {
      title: "Vietnam Tourism: Hanoi attractions",
      url: "https://vietnam.travel/things-to-do/11-must-see-attractions-ha-noi/",
    },
    {
      title: "Vietnam Tourism: weather and climate",
      url: "https://vietnam.travel/things-to-do/weather-and-climate-vietnam/",
    },
    {
      title: "Vietnam Tourism: transport and travel FAQs",
      url: "https://vietnam.travel/faqs/",
    },
    {
      title: "Tourism Authority of Thailand: climate and weather",
      url: "https://www.tourismthailand.org/Plan-Your-Trip/Weather",
    },
  ],
  Content,
};
