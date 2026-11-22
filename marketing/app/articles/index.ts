import { bangkokVsHanoiArticle } from "./content/bangkok-vs-hanoi";
import { berlinVsAmsterdamArticle } from "./content/berlin-vs-amsterdam";
import { bestGroupHolidayDestinations2027Article } from "./content/best-group-holiday-destinations-2027";
import { bestStagAndHenDestinationsAbroad2027Article } from "./content/best-stag-and-hen-destinations-abroad-2027";
import { bestTravelPlanningAppsArticle } from "./content/best-travel-planning-apps";
import { cheapestHolidayDestinations2027Article } from "./content/cheapest-holiday-destinations-2027";
import { dubaiVsMarrakechArticle } from "./content/dubai-vs-marrakech";
import { dubaiVsMiamiArticle } from "./content/dubai-vs-miami";
import { eventsWorthPlanningATripAround2027Article } from "./content/events-worth-planning-a-trip-around-2027";
import { howToCreateTravelItineraryArticle } from "./content/how-to-create-travel-itinerary";
import { howToPlanAGroupHolidayArticle } from "./content/how-to-plan-a-group-holiday";
import { ibizaVsMykonosArticle } from "./content/ibiza-vs-mykonos";
import { krakowVsBudapestArticle } from "./content/krakow-vs-budapest";
import { krakowVsPragueArticle } from "./content/krakow-vs-prague";
import { lasVegasVsNewYorkArticle } from "./content/las-vegas-vs-new-york";
import { marbellaVsIbizaArticle } from "./content/marbella-vs-ibiza";
import { miamiVsLasVegasArticle } from "./content/miami-vs-las-vegas";
import { parisVsAmsterdamArticle } from "./content/paris-vs-amsterdam";
import { phuketVsBaliArticle } from "./content/phuket-vs-bali";
import { pragueVsBudapestArticle } from "./content/prague-vs-budapest";
import { splitVsMykonosArticle } from "./content/split-vs-mykonos";
import { tenerifeVsMarbellaArticle } from "./content/tenerife-vs-marbella";
import { tokyoVsSeoulArticle } from "./content/tokyo-vs-seoul";
import { travelPlanningChecklistArticle } from "./content/travel-planning-checklist";
import { triptrackVsTripitArticle } from "./content/triptrack-vs-tripit";
import { tulumVsBaliArticle } from "./content/tulum-vs-bali";
import { wanderlogVsTriptrackArticle } from "./content/wanderlog-vs-triptrack";
import type { ArticleCategorySlug, TravelArticle } from "./types";

export const travelArticles: TravelArticle[] = [
  bestGroupHolidayDestinations2027Article,
  howToPlanAGroupHolidayArticle,
  eventsWorthPlanningATripAround2027Article,
  cheapestHolidayDestinations2027Article,
  bestStagAndHenDestinationsAbroad2027Article,
  bestTravelPlanningAppsArticle,
  wanderlogVsTriptrackArticle,
  triptrackVsTripitArticle,
  ibizaVsMykonosArticle,
  marbellaVsIbizaArticle,
  krakowVsBudapestArticle,
  dubaiVsMarrakechArticle,
  miamiVsLasVegasArticle,
  tulumVsBaliArticle,
  bangkokVsHanoiArticle,
  howToCreateTravelItineraryArticle,
  travelPlanningChecklistArticle,
  parisVsAmsterdamArticle,
  tokyoVsSeoulArticle,
  pragueVsBudapestArticle,
  splitVsMykonosArticle,
  tenerifeVsMarbellaArticle,
  krakowVsPragueArticle,
  berlinVsAmsterdamArticle,
  dubaiVsMiamiArticle,
  lasVegasVsNewYorkArticle,
  phuketVsBaliArticle,
];

export const articleCategories: {
  slug: ArticleCategorySlug;
  label: string;
  description: string;
}[] = [
  {
    slug: "destination-comparisons",
    label: "Destination comparisons",
    description:
      "Balanced, like-for-like comparisons to help you choose where to travel next.",
  },
  {
    slug: "product-comparisons",
    label: "Travel planner comparisons",
    description:
      "Evidence-led comparisons of travel-planning apps, their prices and the travellers they suit.",
  },
  {
    slug: "travel-inspiration",
    label: "Travel inspiration",
    description:
      "Where to go next with your friends: trending destinations, big events and ideas inspired by what everyone is watching and playing.",
  },
  {
    slug: "travel-planning",
    label: "Travel planning",
    description:
      "Practical methods and checklists for turning an idea into an organised trip.",
  },
];

export function getArticle(slug: string): TravelArticle | undefined {
  return travelArticles.find((article) => article.slug === slug);
}

export function getArticleCategory(categorySlug: string) {
  return articleCategories.find((category) => category.slug === categorySlug);
}

export function getArticlesByCategory(categorySlug: ArticleCategorySlug) {
  return travelArticles.filter((article) => article.categorySlug === categorySlug);
}
