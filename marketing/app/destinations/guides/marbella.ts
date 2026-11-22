import type { DestinationGuide } from "../types";

export const marbellaGuide: DestinationGuide = {
  slug: "marbella-travel-guide",
  city: "Marbella",
  country: "Spain",
  region: "Europe",
  image: {
    src: "https://images.unsplash.com/photo-1780658309233-465e54f70a72?auto=format&fit=crop&w=1600&q=80",
    alt: "A sunny square in Marbella's old town with a white building and a statue",
    width: 1600,
    height: 1067,
    credit: {
      name: "Milan Trninic",
      url: "https://unsplash.com/photos/Ch8BdNFpo8I",
      source: "Unsplash",
    },
  },
  title: "Marbella Travel Guide: Old Town, Beach Clubs and Where to Stay",
  description:
    "A practical Marbella guide for groups: the old town, Puerto Banús and the best beach clubs, where to eat, where to stay and quieter corners, with a 4-day itinerary.",
  intro: [
    "Marbella is the Costa del Sol's smartest resort, with two very different faces. The old town is a pretty tangle of whitewashed streets, orange trees and tapas bars around the Plaza de los Naranjos. A few kilometres west, Puerto Banús is all superyachts, designer shops and late nights.",
    "For groups, Marbella works because it is easy. Málaga airport is about 45 minutes away, the weather is reliably warm for much of the year and you can mix lazy beach-club days with proper dinners and a big night out without needing a car for every stop.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary balances the old town, beach clubs, Puerto Banús and a day trip to Ronda, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "May, June, September and October are ideal: warm enough for the beach, with lighter crowds and lower prices than high summer. July and August are hot and busy, and beach clubs need booking well ahead. Winter is mild and sunny, which suits a golf trip or a cheap city-and-coast break, though some beach clubs close for the season.",
  restaurants: [
    {
      name: "Bar El Estrecho",
      area: "Old Town",
      description:
        "A narrow, long-running tapas bar in the old town, busy with locals. Squeeze in at the bar and order fried fish and croquetas.",
    },
    {
      name: "Casanis Bistrot",
      area: "Old Town",
      description:
        "French-Mediterranean cooking in a courtyard off Calle Ancha. A good choice for a relaxed group dinner.",
    },
    {
      name: "La Sala Puerto Banús",
      area: "Puerto Banús",
      description:
        "A lively restaurant and bar that turns into a party later on, popular with hen and stag groups. Book for weekends.",
    },
    {
      name: "Bibo Marbella",
      area: "Golden Mile",
      description:
        "Dani García's playful Andalusian brasserie at Puente Romano, with a colourful dining room and sharing plates.",
    },
    {
      name: "Leña Marbella",
      area: "Golden Mile",
      description:
        "A wood-fire steakhouse from the same chef, also at Puente Romano. Good for a meat-heavy celebration dinner.",
    },
    {
      name: "La Plage Casanis",
      area: "Marbella seafront",
      description:
        "A beachfront restaurant from the Casanis team, good for a long lunch with your feet near the sand.",
    },
  ],
  thingsToDo: [
    {
      name: "Plaza de los Naranjos",
      area: "Old Town",
      description:
        "The heart of the old town, lined with orange trees and the 16th-century town hall. Lovely for an evening drink.",
    },
    {
      name: "Puerto Banús",
      area: "Puerto Banús",
      description:
        "The glitzy marina of yachts, supercars, designer shops and bars. Go at dusk and stay for the nightlife.",
    },
    {
      name: "Ocean Club",
      area: "Puerto Banús",
      description:
        "A big beach club with a huge pool, day beds and DJs. A classic for hen and stag groups; reserve a bed ahead.",
    },
    {
      name: "Avenida del Mar",
      area: "Town centre",
      description:
        "A pedestrian boulevard linking the old town to the beach, lined with Salvador Dalí sculptures.",
    },
    {
      name: "Ronda day trip",
      area: "Inland",
      description:
        "A dramatic white town split by a deep gorge and spanned by the Puente Nuevo, about an hour inland by car or coach.",
    },
    {
      name: "Nikki Beach Marbella",
      area: "Elviria",
      description:
        "A white-themed beach club east of town known for long Sunday parties and champagne sprays.",
    },
    {
      name: "La Concha hike",
      area: "Sierra Blanca",
      description:
        "A challenging half-day hike to the peak above Marbella, with views to Gibraltar and Africa on clear days. Start early.",
    },
    {
      name: "Golden Mile",
      area: "West of town",
      description:
        "A walk or bike ride along the seafront promenade past the grand hotels and villas towards Puerto Banús.",
    },
  ],
  whereToStay: [
    {
      name: "Puente Romano Beach Resort",
      area: "Golden Mile",
      description:
        "A luxury village-style resort between town and Puerto Banús with restaurants and a beach club. Suits a special-occasion trip.",
    },
    {
      name: "Hotel El Fuerte",
      area: "Town centre",
      description:
        "A classic hotel on the seafront, a short walk from the old town. Suits groups who want to walk everywhere.",
    },
    {
      name: "Amàre Beach Hotel Marbella",
      area: "Town centre",
      description:
        "An adults-only beachfront hotel with a rooftop and pool. Suits friends' trips and hen dos.",
    },
    {
      name: "The Town House",
      area: "Old Town",
      description:
        "A small boutique hotel in a whitewashed house on a quiet old-town square. Suits couples and small groups.",
    },
  ],
  hiddenGems: [
    {
      name: "Museo del Bonsái",
      area: "Arroyo de la Represa park",
      description:
        "A small, peaceful museum of bonsai trees in a park near the old town, a cool escape from the heat.",
    },
    {
      name: "Dunas de Artola",
      area: "Cabopino",
      description:
        "Protected sand dunes and a boardwalk next to a wide, quieter beach east of town.",
    },
    {
      name: "Istán",
      area: "Sierra de las Nieves",
      description:
        "A white village up the valley above the Concepción reservoir, with natural springs and mountain views.",
    },
    {
      name: "Refugio de Juanar",
      area: "Sierra Blanca",
      description:
        "A mountain lodge in pine and olive woods with trails to a viewpoint over the coast.",
    },
  ],
  templateSlug: "marbella-4-days-itinerary",
  templateTitle:
    "Marbella in 4 days: old town, beach clubs and a day in Ronda",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
