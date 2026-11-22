import type { DestinationGuide } from "../types";

export const miamiGuide: DestinationGuide = {
  slug: "miami-travel-guide",
  city: "Miami",
  country: "United States",
  region: "North America",
  image: {
    src: "https://images.unsplash.com/photo-1543968332-f99478b1ebdc?auto=format&fit=crop&w=1600&q=80",
    alt: "Art Deco buildings and parked cars along a street in South Beach, Miami",
    width: 1600,
    height: 1067,
    credit: {
      name: "Tuan Nguyen",
      url: "https://unsplash.com/photos/kHP6Lfd8e_0",
      source: "Unsplash",
    },
  },
  title: "Miami Travel Guide: South Beach, Wynwood and Where to Eat",
  description:
    "A practical Miami guide for groups: South Beach and Ocean Drive, Wynwood, Little Havana, the best nightlife, where to eat, where to stay and quieter corners, with a 4-day itinerary.",
  intro: [
    "Miami is beaches, Art Deco and neon, Cuban coffee and late-night clubs, all under near-constant sunshine. South Beach's Ocean Drive, with its pastel hotels and palm trees, is one of the most recognisable streets in the world, and it has a fresh spotlight as the real-life inspiration for the Vice City of GTA VI.",
    "Beyond the beach, the city is a patchwork of distinct neighbourhoods. Wynwood is covered in murals and craft breweries, Little Havana has domino parks and ventanita coffee windows, Brickell has rooftop bars, and Key Biscayne and the Everglades are within easy reach.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary balances beach days, neighbourhoods and a big night out, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "November to April is the best time to visit, with warm, dry weather and lower humidity. Spring break in March is busy and loud on South Beach. Summer is hot, humid and stormy, and hurricane season runs from June to November, peaking in August to October, so check forecasts and travel insurance. December to March is peak season for prices.",
  restaurants: [
    {
      name: "Versailles",
      area: "Little Havana",
      description:
        "The city's most famous Cuban restaurant, with a ventanita window for café cubano and croquetas.",
    },
    {
      name: "Joe's Stone Crab",
      area: "South Beach",
      description:
        "A Miami institution since 1913, famous for stone crabs in season and key lime pie. Expect a wait.",
    },
    {
      name: "Coyo Taco",
      area: "Wynwood",
      description:
        "Busy taqueria with a bar in the back, ideal before a night out in Wynwood.",
    },
    {
      name: "Mandolin Aegean Bistro",
      area: "Design District",
      description:
        "Greek and Turkish dishes in a garden courtyard, a relaxed group lunch.",
    },
    {
      name: "Time Out Market Miami",
      area: "South Beach",
      description:
        "A food hall with stalls from local chefs, good when a group wants different things.",
    },
    {
      name: "La Sandwicherie",
      area: "South Beach",
      description:
        "A late-night sandwich counter that has fed South Beach clubbers for decades.",
    },
  ],
  thingsToDo: [
    {
      name: "Ocean Drive and the Art Deco District",
      area: "South Beach",
      description:
        "Pastel Art Deco hotels and neon signs facing the beach. Walk it at dusk when the lights come on.",
    },
    {
      name: "South Beach",
      area: "Miami Beach",
      description:
        "Wide sand, lifeguard huts and warm sea. Lummus Park is the classic stretch.",
    },
    {
      name: "Wynwood Walls",
      area: "Wynwood",
      description:
        "An outdoor gallery of huge murals in a district of street art, breweries and bars.",
    },
    {
      name: "Little Havana",
      area: "Little Havana",
      description:
        "Calle Ocho's cigar shops, Domino Park and Cuban music bars.",
    },
    {
      name: "Vizcaya Museum and Gardens",
      area: "Coconut Grove",
      description:
        "An Italian Renaissance-style villa and gardens on Biscayne Bay.",
    },
    {
      name: "Everglades airboat tour",
      area: "Everglades",
      description:
        "Skim across the sawgrass to spot alligators, about an hour from downtown.",
    },
    {
      name: "Key Biscayne",
      area: "Key Biscayne",
      description:
        "Quieter beaches and a lighthouse at Bill Baggs Cape Florida State Park.",
    },
    {
      name: "Brickell rooftop bars",
      area: "Brickell",
      description:
        "Skyline views from rooftop bars in the financial district.",
    },
  ],
  whereToStay: [
    {
      name: "The Betsy",
      area: "South Beach",
      description:
        "A boutique hotel on Ocean Drive with a rooftop and literary feel. Suits couples and smaller groups.",
    },
    {
      name: "The Setai",
      area: "South Beach",
      description:
        "A luxury beachfront hotel with three pools. Suits a special-occasion trip.",
    },
    {
      name: "Freehand Miami",
      area: "Miami Beach",
      description:
        "A hotel and hostel with the acclaimed Broken Shaker bar. Suits groups on a budget.",
    },
    {
      name: "Arlo Wynwood",
      area: "Wynwood",
      description:
        "A modern hotel close to the murals and bars. Suits groups who want nightlife off the beach.",
    },
  ],
  hiddenGems: [
    {
      name: "Broken Shaker",
      area: "Miami Beach",
      description:
        "An award-winning cocktail bar around a pool and garden at the Freehand hotel.",
    },
    {
      name: "Venetian Pool",
      area: "Coral Gables",
      description:
        "A 1920s public pool carved from a coral rock quarry, with waterfalls and grottoes.",
    },
    {
      name: "Domino Park",
      area: "Little Havana",
      description:
        "Watch locals play dominoes at Máximo Gómez Park on Calle Ocho.",
    },
    {
      name: "Bill Baggs lighthouse",
      area: "Key Biscayne",
      description:
        "The oldest standing structure in Miami-Dade, at the tip of Key Biscayne.",
    },
  ],
  templateSlug: "miami-4-days-itinerary",
  templateTitle:
    "Miami in 4 days: South Beach, Wynwood and Little Havana",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
