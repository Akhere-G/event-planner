import type { DestinationGuide } from "../types";

export const berlinGuide: DestinationGuide = {
  slug: "berlin-travel-guide",
  city: "Berlin",
  country: "Germany",
  region: "Europe",
  image: {
    src: "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=1600&q=80",
    alt: "The Brandenburg Gate in Berlin lit up at night",
    width: 1600,
    height: 1067,
    credit: {
      name: "Florian Wehde",
      url: "https://unsplash.com/photos/uFGi0_YciE0",
      source: "Unsplash",
    },
  },
  title: "Berlin Travel Guide: History, Nightlife and Where to Eat",
  description:
    "A practical Berlin guide for groups: the Wall and the big sights, which neighbourhoods suit a night out, where to eat, where to stay and quieter corners, with a 4-day itinerary.",
  intro: [
    "Berlin is a city you feel as much as see. Its history is everywhere, from the Brandenburg Gate and the Reichstag dome to the stretches of the Wall that still cut through neighbourhoods. Yet it is also young, scruffy and creative, with a nightlife that famously starts late and does not stop.",
    "The city is huge and spread out, so it helps to think in neighbourhoods. Mitte has the landmarks and museums, Kreuzberg and Neukölln have the canal-side bars and street food, Friedrichshain has the East Side Gallery and big clubs, and Prenzlauer Berg is leafy and full of brunch spots.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary balances history, food and a proper night out, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "May to September is best for beer gardens, open-air bars and lake swims, with long light evenings. Spring and early autumn are mild and quieter. Winter is cold and grey, but the Christmas markets from late November are a big draw. The clubs run all year, and many are busiest from Saturday night into Sunday.",
  restaurants: [
    {
      name: "Curry 36",
      area: "Kreuzberg",
      description:
        "A late-opening stand famous for currywurst and chips, the classic Berlin snack.",
    },
    {
      name: "Mustafa's Gemüse Kebap",
      area: "Kreuzberg",
      description:
        "A legendary vegetable döner stall with a queue to match. Worth the wait.",
    },
    {
      name: "Markthalle Neun",
      area: "Kreuzberg",
      description:
        "A restored market hall with food stalls, a bakery and a craft brewery. On Thursday evenings it hosts a street-food night.",
    },
    {
      name: "Prater Garten",
      area: "Prenzlauer Berg",
      description:
        "Berlin's oldest beer garden, with long tables under chestnut trees. Perfect for a group on a summer evening.",
    },
    {
      name: "Katz Orange",
      area: "Mitte",
      description:
        "A handsome restaurant in a former brewery known for slow-roasted meat dishes. Good for a group dinner.",
    },
    {
      name: "Zur letzten Instanz",
      area: "Mitte",
      description:
        "One of Berlin's oldest restaurants, serving traditional German dishes like pork knuckle in old wood-panelled rooms.",
    },
  ],
  thingsToDo: [
    {
      name: "Brandenburg Gate",
      area: "Mitte",
      description:
        "The city's great symbol of division and reunification. Visit early, then walk to the Reichstag.",
    },
    {
      name: "Reichstag dome",
      area: "Tiergarten",
      description:
        "Walk up the glass dome above the parliament. Entry is free but you must register online in advance.",
    },
    {
      name: "East Side Gallery",
      area: "Friedrichshain",
      description:
        "The longest surviving stretch of the Wall, covered in murals by artists from around the world.",
    },
    {
      name: "Berlin Wall Memorial",
      area: "Mitte",
      description:
        "A preserved section of the border strip with a watchtower and a moving open-air exhibition.",
    },
    {
      name: "Museum Island",
      area: "Mitte",
      description:
        "Five world-class museums on an island in the Spree, including the Neues Museum's bust of Nefertiti.",
    },
    {
      name: "Memorial to the Murdered Jews of Europe",
      area: "Mitte",
      description:
        "A field of concrete slabs near the Brandenburg Gate, with an information centre underneath.",
    },
    {
      name: "Tempelhofer Feld",
      area: "Tempelhof",
      description:
        "A former airport turned into a huge park, where you can cycle or skate down the old runways.",
    },
    {
      name: "Mauerpark Sunday flea market",
      area: "Prenzlauer Berg",
      description:
        "A sprawling flea market and open-air karaoke in the park on Sundays.",
    },
  ],
  whereToStay: [
    {
      name: "Hotel Adlon Kempinski",
      area: "Mitte",
      description:
        "Berlin's grand hotel beside the Brandenburg Gate. Suits a special-occasion trip.",
    },
    {
      name: "Michelberger Hotel",
      area: "Friedrichshain",
      description:
        "A creative, sociable hotel by the Warschauer Strasse station, close to the East Side Gallery and big clubs.",
    },
    {
      name: "Hotel Oderberger",
      area: "Prenzlauer Berg",
      description:
        "A hotel in a restored public bath, with its historic pool still open to guests.",
    },
    {
      name: "Generator Berlin Mitte",
      area: "Mitte",
      description:
        "A large, lively hostel with private rooms and dorms. Suits groups on a budget.",
    },
  ],
  hiddenGems: [
    {
      name: "Teufelsberg",
      area: "Grunewald",
      description:
        "An abandoned Cold War listening station on a hill of rubble, now covered in street art.",
    },
    {
      name: "Klunkerkranich",
      area: "Neukölln",
      description:
        "A rooftop bar and garden on top of a shopping centre car park, with sunset views.",
    },
    {
      name: "Landwehr Canal",
      area: "Kreuzberg",
      description:
        "The canal banks around Paul-Lincke-Ufer, lined with cafés and the Turkish market on Tuesdays and Fridays.",
    },
    {
      name: "Treptower Park Soviet War Memorial",
      area: "Treptow",
      description:
        "A vast, monumental memorial and cemetery in a riverside park.",
    },
  ],
  templateSlug: "berlin-4-days-itinerary",
  templateTitle:
    "Berlin in 4 days: the Wall, Museum Island and a proper night out",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
