import type { DestinationGuide } from "../types";

export const krakowGuide: DestinationGuide = {
  slug: "krakow-travel-guide",
  city: "Kraków",
  country: "Poland",
  region: "Europe",
  image: {
    src: "https://images.unsplash.com/photo-1707836995984-d7eb71186d09?auto=format&fit=crop&w=1600&q=80",
    alt: "Doves on the cobbles of Kraków's old town in front of a historic building",
    width: 1600,
    height: 1067,
    credit: {
      name: "Aimable Mugabo",
      url: "https://unsplash.com/photos/iLr6iT9buiQ",
      source: "Unsplash",
    },
  },
  title: "Kraków Travel Guide: Old Town, Kazimierz and Where to Eat",
  description:
    "A practical Kraków guide for groups: the Old Town and Wawel, Kazimierz's bars and food, day trips to Auschwitz and the salt mine, where to stay and quieter corners, with a 3-day itinerary.",
  intro: [
    "Kraków is one of Europe's best-value city breaks and one of its most beautiful. Its huge medieval market square, Rynek Główny, is ringed with cafés and topped by the twin towers of St Mary's Basilica, and Wawel Castle watches over the Vistula river.",
    "It is also a city of real weight. A short drive away, the Auschwitz-Birkenau memorial is a sobering visit that many groups choose to make, and the Jewish quarter of Kazimierz tells a long story of life in the city before the war. Today Kazimierz is also where the best bars and food trucks are.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 3-day itinerary paces the Old Town, Kazimierz and the two classic day trips, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "May to September brings warm weather and long evenings in the square's beer gardens. Late spring and early autumn are quieter. December is magical, with a Christmas market on the main square, but bitterly cold. Prices stay low year-round, which is why Kraków is a stag and hen favourite.",
  restaurants: [
    {
      name: "Pod Wawelem",
      area: "Old Town",
      description:
        "A big, cheerful beer hall serving huge portions of Polish classics. Ideal for a hungry group.",
    },
    {
      name: "Pierogarnia Krakowiacy",
      area: "Old Town",
      description:
        "A homely pierogi restaurant with fillings from potato and cheese to duck. Cheap and filling.",
    },
    {
      name: "Starka",
      area: "Kazimierz",
      description:
        "A cosy Kazimierz restaurant with home-made flavoured vodkas and Polish cooking.",
    },
    {
      name: "Plac Nowy zapiekanki",
      area: "Kazimierz",
      description:
        "The round market hall at Plac Nowy sells zapiekanki, long open baguette toasties, late into the night.",
    },
    {
      name: "Bar Mleczny Pod Temidą",
      area: "Old Town",
      description:
        "A traditional milk bar, a cheap self-service canteen serving soups and dumplings.",
    },
    {
      name: "Szara Kazimierz",
      area: "Kazimierz",
      description:
        "A smart restaurant on Szeroka street with Polish and European dishes. Good for a nicer dinner.",
    },
  ],
  thingsToDo: [
    {
      name: "Main Market Square",
      area: "Old Town",
      description:
        "Rynek Główny, with the Cloth Hall and St Mary's Basilica. Listen for the trumpet call every hour from the tower.",
    },
    {
      name: "Wawel Castle and Cathedral",
      area: "Wawel Hill",
      description:
        "The royal castle and cathedral on the hill above the river. Book timed tickets for the state rooms.",
    },
    {
      name: "Kazimierz",
      area: "Kazimierz",
      description:
        "The historic Jewish quarter of synagogues, galleries and bars. Join a walking tour for the history.",
    },
    {
      name: "Auschwitz-Birkenau Memorial",
      area: "Oświęcim",
      description:
        "The former Nazi concentration and extermination camp, about 90 minutes away. Book a guided visit well in advance.",
    },
    {
      name: "Wieliczka Salt Mine",
      area: "Wieliczka",
      description:
        "A centuries-old mine of carved salt chapels deep underground, 30 minutes from the centre. Book ahead.",
    },
    {
      name: "Oskar Schindler's Factory",
      area: "Podgórze",
      description:
        "A museum about the city under Nazi occupation, in Schindler's former enamel factory.",
    },
    {
      name: "Vistula boulevards",
      area: "Riverside",
      description:
        "Riverside paths and moored bar boats below Wawel, good for an evening drink.",
    },
    {
      name: "Underground Museum",
      area: "Old Town",
      description:
        "A museum beneath the market square showing the medieval city's foundations.",
    },
  ],
  whereToStay: [
    {
      name: "Hotel Stary",
      area: "Old Town",
      description:
        "A luxury hotel in an 18th-century townhouse, steps from the square, with a spa. Suits a special trip.",
    },
    {
      name: "PURO Kraków Kazimierz",
      area: "Kazimierz",
      description:
        "A modern design hotel on the edge of Kazimierz. Suits groups who want bars and restaurants nearby.",
    },
    {
      name: "Hotel Indigo Krakow - Old Town",
      area: "Old Town",
      description:
        "A comfortable hotel close to the main square and the station. Suits a first visit.",
    },
    {
      name: "Mosquito Hostel",
      area: "Old Town",
      description:
        "A friendly, central hostel with private rooms and dorms. Suits a tight budget.",
    },
  ],
  hiddenGems: [
    {
      name: "Kopiec Krakusa",
      area: "Podgórze",
      description:
        "An ancient earth mound on a hill south of the river with a sweeping view of the city at sunset.",
    },
    {
      name: "Zakrzówek",
      area: "Dębniki",
      description:
        "A flooded former quarry with turquoise water, now a public swimming area in summer.",
    },
    {
      name: "Nowa Huta",
      area: "Nowa Huta",
      description:
        "A planned socialist-realist district built in the 1950s, best seen on a guided tour.",
    },
    {
      name: "Ghetto Heroes Square",
      area: "Podgórze",
      description:
        "A quiet memorial of empty bronze chairs on the site of the former ghetto.",
    },
  ],
  templateSlug: "krakow-3-days-itinerary",
  templateTitle:
    "Kraków in 3 days: Old Town, Kazimierz, Auschwitz and the salt mine",
  templateDays: 3,
  publishedAt: "2026-11-22",
};
