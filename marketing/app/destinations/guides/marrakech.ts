import type { DestinationGuide } from "../types";

export const marrakechGuide: DestinationGuide = {
  slug: "marrakech-travel-guide",
  city: "Marrakech",
  country: "Morocco",
  region: "Middle East & Africa",
  image: {
    src: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=80",
    alt: "The Koutoubia Mosque minaret rising above Marrakech with the snow-capped Atlas Mountains behind",
    width: 1600,
    height: 1064,
    credit: {
      name: "Paul Macallan",
      url: "https://unsplash.com/photos/CFKksjYRSQ8",
      source: "Unsplash",
    },
  },
  title: "Marrakech Travel Guide: Medina, Souks and Where to Stay",
  description:
    "A practical Marrakech guide for groups: the medina, souks and Jemaa el-Fnaa, riads and pool villas, where to eat, Atlas day trips and quieter corners, with a 4-day itinerary.",
  intro: [
    "Marrakech is under four hours from most UK airports and feels a world away. Its walled medina is a maze of souks selling lanterns, leather and spices, opening onto palaces, gardens and the great square of Jemaa el-Fnaa, which fills each evening with food stalls, musicians and storytellers.",
    "For groups, the city's riads are the secret weapon. These traditional houses are built around inner courtyards, and many can be booked whole, giving you a private pool, a roof terrace and staff who cook breakfast. Beyond the walls, pool villas in the Palmeraie and day trips to the Atlas Mountains and the Agafay desert add space and adventure.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary paces the medina, a hammam, gardens and a day in the mountains, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "March to May and September to November are the best months, with warm days and cool evenings. Summer is very hot, often above 40°C, so plan sightseeing for the morning and evening. Winter days are sunny and mild, but nights are cold and many riads have limited heating. Ramadan dates change each year and can affect opening hours.",
  restaurants: [
    {
      name: "Jemaa el-Fnaa food stalls",
      area: "Medina",
      description:
        "Every evening the square fills with grills and stalls serving tagines, snails and harira soup. Pick a busy stall.",
    },
    {
      name: "Nomad",
      area: "Medina",
      description:
        "A modern Moroccan restaurant with a roof terrace over the spice square. Book for sunset.",
    },
    {
      name: "Café des Épices",
      area: "Medina",
      description:
        "A relaxed café on the spice square, good for mint tea and a light lunch.",
    },
    {
      name: "Le Jardin",
      area: "Medina",
      description:
        "A green courtyard restaurant in a restored riad, a calm break from the souks.",
    },
    {
      name: "Al Fassia",
      area: "Guéliz",
      description:
        "A long-running restaurant run by women, known for slow-cooked lamb shoulder and Moroccan salads. Book ahead.",
    },
    {
      name: "Comptoir Darna",
      area: "Hivernage",
      description:
        "A lively restaurant with belly dancing and a bar that suits a big birthday or hen night.",
    },
  ],
  thingsToDo: [
    {
      name: "Jemaa el-Fnaa",
      area: "Medina",
      description:
        "The great square at the heart of the medina. Watch the sunset from a café terrace as the evening market sets up.",
    },
    {
      name: "The souks",
      area: "Medina",
      description:
        "Lanes of stalls north of the square selling lanterns, leather, spices and rugs. Agree a price before you buy.",
    },
    {
      name: "Jardin Majorelle",
      area: "Guéliz",
      description:
        "A cobalt-blue garden once owned by Yves Saint Laurent, next to the YSL Museum. Book timed tickets.",
    },
    {
      name: "Bahia Palace",
      area: "Medina",
      description:
        "A 19th-century palace of tiled courtyards and painted ceilings.",
    },
    {
      name: "Ben Youssef Madrasa",
      area: "Medina",
      description:
        "A beautifully restored former Islamic college with carved cedar and stucco.",
    },
    {
      name: "A hammam",
      area: "Medina",
      description:
        "A traditional steam bath and scrub. Book a spa hammam for a group or try a local one for the real thing.",
    },
    {
      name: "Atlas Mountains and Imlil day trip",
      area: "High Atlas",
      description:
        "A day in the mountains with a walk through Berber villages, about 90 minutes away.",
    },
    {
      name: "Agafay desert",
      area: "Agafay",
      description:
        "A stony desert 45 minutes away with camel rides, quad bikes and dinner at a camp.",
    },
  ],
  whereToStay: [
    {
      name: "Book a whole riad",
      area: "Medina",
      description:
        "Many riads can be rented whole for a group, with a plunge pool, roof terrace and breakfast. Check how far it is to walk from the nearest road.",
    },
    {
      name: "La Mamounia",
      area: "Medina edge",
      description:
        "The city's legendary grand hotel, set in huge gardens. Suits a once-in-a-lifetime trip.",
    },
    {
      name: "El Fenn",
      area: "Medina",
      description:
        "A colourful boutique riad hotel with a famous rooftop bar near the Koutoubia.",
    },
    {
      name: "Palmeraie pool villas",
      area: "Palmeraie",
      description:
        "Villas with big pools in the palm groves outside the city. Suits larger groups who want space.",
    },
  ],
  hiddenGems: [
    {
      name: "Le Jardin Secret",
      area: "Medina",
      description:
        "A restored riad garden with a tower view over the rooftops, peaceful even in high season.",
    },
    {
      name: "Saadian Tombs",
      area: "Kasbah",
      description:
        "Ornate royal tombs hidden for centuries and rediscovered in 1917.",
    },
    {
      name: "Menara Gardens",
      area: "West of the medina",
      description:
        "Olive groves around a large pool with a pavilion and the Atlas Mountains behind.",
    },
    {
      name: "Mellah",
      area: "Medina",
      description:
        "The old Jewish quarter, with a restored synagogue and a quieter spice market.",
    },
  ],
  templateSlug: "marrakech-4-days-itinerary",
  templateTitle:
    "Marrakech in 4 days: souks, gardens, hammam and the Atlas",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
