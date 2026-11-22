import type { DestinationGuide } from "../types";

export const lasVegasGuide: DestinationGuide = {
  slug: "las-vegas-travel-guide",
  city: "Las Vegas",
  country: "United States",
  region: "North America",
  image: {
    src: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&w=1600&q=80",
    alt: "The Las Vegas Strip lit up at night",
    width: 1600,
    height: 1067,
    credit: {
      name: "Julian Paefgen",
      url: "https://unsplash.com/photos/uxU_jyu9e7U",
      source: "Unsplash",
    },
  },
  title: "Las Vegas Travel Guide: The Strip, Shows and Day Trips",
  description:
    "A practical Las Vegas guide for groups: the Strip and Fremont Street, shows, pool parties, where to eat, where to stay, Grand Canyon and desert day trips and quieter corners, with a 4-day itinerary.",
  intro: [
    "Las Vegas is the ultimate group-trip city: giant themed resorts, world-class shows, pool parties, buffets and casinos that never close. For many Brits it is a bucket-list stag, hen or milestone birthday, often combined with a road trip through the American South West.",
    "The Strip is where most of the action is, a four-mile line of resorts from Mandalay Bay to the Strat, each with its own restaurants, bars and entertainment. Downtown, Fremont Street has the older casinos and a canopy light show, while the Arts District offers a more local scene of bars and vintage shops.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary balances the Strip, a show, a pool day and a trip out to the desert, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "March to May and September to November bring warm days and comfortable evenings. Summer is extremely hot, often above 40°C, which suits pool parties but makes walking the Strip hard during the day. Winter is mild by day and cold at night. Prices swing with conventions and big events, so compare a few dates before you book.",
  restaurants: [
    {
      name: "Bacchanal Buffet",
      area: "Caesars Palace",
      description:
        "The Strip's most famous buffet, with hundreds of dishes. Arrive hungry and book a time slot.",
    },
    {
      name: "Secret Pizza",
      area: "The Cosmopolitan",
      description:
        "An unmarked pizza counter down a corridor of album covers, open late.",
    },
    {
      name: "Gordon Ramsay Hell's Kitchen",
      area: "Caesars Palace",
      description:
        "Beef Wellington and sticky toffee pudding in a room modelled on the TV show. Book ahead.",
    },
    {
      name: "Lotus of Siam",
      area: "East of the Strip",
      description:
        "Award-winning northern Thai cooking, much loved by locals.",
    },
    {
      name: "Eataly",
      area: "Park MGM",
      description:
        "An Italian food hall with pasta, pizza and a bar, handy for a group.",
    },
    {
      name: "In-N-Out Burger",
      area: "Near the LINQ",
      description:
        "The West Coast burger chain, a cheap and classic late-night stop.",
    },
  ],
  thingsToDo: [
    {
      name: "Bellagio fountains",
      area: "Centre Strip",
      description:
        "Free fountain shows set to music every 15 to 30 minutes in the evening.",
    },
    {
      name: "A big show",
      area: "Across the Strip",
      description:
        "Cirque du Soleil, comedians and residencies run most nights. Book ahead for the best seats.",
    },
    {
      name: "Sphere",
      area: "East of the Strip",
      description:
        "A giant LED globe with immersive concerts and films inside. Check what is showing.",
    },
    {
      name: "Pool party",
      area: "Resort pools",
      description:
        "Day clubs at the big resorts run from spring to early autumn, with DJs and cabanas. Book cabanas well ahead.",
    },
    {
      name: "Fremont Street Experience",
      area: "Downtown",
      description:
        "The old casino strip under a canopy light show, with zip lines overhead.",
    },
    {
      name: "Grand Canyon day trip",
      area: "Arizona",
      description:
        "Coach and helicopter tours to the West Rim and Skywalk, or a long day to the South Rim.",
    },
    {
      name: "Red Rock Canyon",
      area: "West of the city",
      description:
        "A scenic drive and hiking trails among red sandstone, about 30 minutes away.",
    },
    {
      name: "Welcome to Fabulous Las Vegas sign",
      area: "South Strip",
      description:
        "The famous sign at the south end of the Strip, with a small car park for photos.",
    },
  ],
  whereToStay: [
    {
      name: "Bellagio",
      area: "Centre Strip",
      description:
        "A classic luxury resort with the fountains outside. Suits a special-occasion trip.",
    },
    {
      name: "The Cosmopolitan",
      area: "Centre Strip",
      description:
        "A stylish resort with good bars and restaurants. Suits groups who want nightlife on site.",
    },
    {
      name: "The LINQ Hotel",
      area: "Centre Strip",
      description:
        "A good-value hotel on a pedestrian street of bars, close to the action.",
    },
    {
      name: "Circa Resort",
      area: "Downtown",
      description:
        "An adults-only resort with a huge pool amphitheatre and big screens. Suits sports fans.",
    },
  ],
  hiddenGems: [
    {
      name: "The Neon Museum",
      area: "Downtown",
      description:
        "A boneyard of restored historic casino signs, best on an evening tour.",
    },
    {
      name: "Arts District",
      area: "Downtown",
      description:
        "Galleries, breweries and vintage shops south of downtown, with a First Friday street event.",
    },
    {
      name: "Seven Magic Mountains",
      area: "South of the city",
      description:
        "A desert art installation of brightly painted stacked boulders.",
    },
    {
      name: "Valley of Fire",
      area: "North-east",
      description:
        "Nevada's oldest state park, with flaming red rock formations about an hour away.",
    },
  ],
  templateSlug: "las-vegas-4-days-itinerary",
  templateTitle:
    "Las Vegas in 4 days: the Strip, a show, a pool party and the Grand Canyon",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
