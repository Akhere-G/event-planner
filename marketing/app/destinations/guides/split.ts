import type { DestinationGuide } from "../types";

export const splitGuide: DestinationGuide = {
  slug: "split-travel-guide",
  city: "Split",
  country: "Croatia",
  region: "Europe",
  image: {
    src: "https://images.unsplash.com/photo-1602436012494-74da0a911c85?auto=format&fit=crop&w=1600&q=80",
    alt: "Boats moored on the waterfront in front of Split's old town",
    width: 1600,
    height: 1068,
    credit: {
      name: "Avery Meeker",
      url: "https://unsplash.com/photos/3KBdXYMYPIU",
      source: "Unsplash",
    },
  },
  title: "Split Travel Guide: Diocletian's Palace, Islands and Where to Eat",
  description:
    "A practical Split guide for groups: Diocletian's Palace, island boat trips, beaches, where to eat, where to stay and quieter corners, with a 4-day itinerary.",
  intro: [
    "Split is a city built inside a Roman emperor's retirement palace. Diocletian's Palace is not a museum you visit but a living neighbourhood, where bars, apartments and shops fill 1,700-year-old walls and the main square still has its columns.",
    "It is also Croatia's gateway to the islands. Ferries and catamarans leave the harbour for Hvar, Brač and Vis, and boat trips to the Blue Cave and the Pakleni Islands are a highlight of any group trip. Back in town, the Riva promenade and the beaches below Marjan Hill make long summer evenings easy.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary covers the palace, a full day on the water, a hike up Marjan and a trip to Hvar, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "June and September are the best months: hot, sunny and lively, with the sea warm enough to swim but without July and August's peak crowds and cruise-ship days. May and early October are quieter and cheaper. Many island boat trips and some beach bars run only from about May to October.",
  restaurants: [
    {
      name: "Konoba Fetivi",
      area: "Varoš",
      description:
        "A family-run tavern known for simply grilled fish and seafood risotto. Book for dinner.",
    },
    {
      name: "Bokeria Kitchen & Wine",
      area: "Old Town",
      description:
        "A lively market-inspired restaurant and wine bar in the old town, good for a group dinner.",
    },
    {
      name: "Zinfandel Food & Wine Bar",
      area: "Old Town",
      description:
        "Croatian wines by the glass with small plates, in a stylish room near the palace.",
    },
    {
      name: "Buffet Fife",
      area: "Riva",
      description:
        "A no-frills local canteen on the western end of the Riva, with hearty Dalmatian dishes at low prices.",
    },
    {
      name: "Kadena",
      area: "Zenta",
      description:
        "A smart terrace restaurant overlooking the sea east of the centre, good for a celebration.",
    },
    {
      name: "Villa Spiza",
      area: "Old Town",
      description:
        "A tiny kitchen with a few seats, cooking what the market had that morning. No bookings.",
    },
  ],
  thingsToDo: [
    {
      name: "Diocletian's Palace",
      area: "Old Town",
      description:
        "The Roman palace at the heart of the city. Visit the Peristyle, the cellars and the cathedral bell tower.",
    },
    {
      name: "Riva promenade",
      area: "Waterfront",
      description:
        "The palm-lined harbourfront, best for coffee in the morning and drinks at dusk.",
    },
    {
      name: "Marjan Hill",
      area: "West of the centre",
      description:
        "A wooded hill park with viewpoints, walking trails and small beaches. Climb the steps from Varoš for the view over the old town.",
    },
    {
      name: "Blue Cave and islands boat trip",
      area: "From Split harbour",
      description:
        "Full-day speedboat trips to the Blue Cave on Biševo, Vis and the Pakleni Islands. Book with a reputable operator.",
    },
    {
      name: "Hvar day trip",
      area: "Hvar",
      description:
        "A catamaran ride to Hvar Town's fortress, harbour and beach bars. Check return times.",
    },
    {
      name: "Bačvice beach",
      area: "Bačvice",
      description:
        "The city's sandy beach, famous for picigin, a local splashing ball game, and bars that stay open late.",
    },
    {
      name: "Krka National Park",
      area: "Inland",
      description:
        "Waterfalls and wooden walkways about an hour north by road. Swimming is no longer allowed at the falls.",
    },
    {
      name: "Green Market",
      area: "Old Town edge",
      description:
        "The open-air market by the palace's east wall, for fruit, cheese and lavender.",
    },
  ],
  whereToStay: [
    {
      name: "Hotel Vestibul Palace",
      area: "Old Town",
      description:
        "A boutique hotel built into the palace walls. Suits couples and a special-occasion trip.",
    },
    {
      name: "Cornaro Hotel",
      area: "Old Town edge",
      description:
        "A modern hotel with a rooftop bar, steps from the palace. Suits groups who want comfort and a central base.",
    },
    {
      name: "Hotel Park Split",
      area: "Bačvice",
      description:
        "A classic hotel near Bačvice beach with a terrace restaurant. Suits travellers who want the beach on the doorstep.",
    },
    {
      name: "Old town apartments",
      area: "Varoš and Old Town",
      description:
        "Self-catering apartments are the most common choice for groups in Split. Check for stairs and noise from bars.",
    },
  ],
  hiddenGems: [
    {
      name: "Kašjuni beach",
      area: "Marjan",
      description:
        "A pebbly bay on the far side of Marjan Hill with clearer water and fewer people than the city beaches.",
    },
    {
      name: "Klis Fortress",
      area: "Klis",
      description:
        "A clifftop fortress above Split with sweeping views, used as a filming location for Game of Thrones.",
    },
    {
      name: "Varoš quarter",
      area: "Varoš",
      description:
        "The old fishermen's district below Marjan, with stone lanes and small taverns.",
    },
    {
      name: "Gregory of Nin statue",
      area: "North gate",
      description:
        "A giant bronze bishop by Ivan Meštrović outside the Golden Gate. Rubbing his toe is said to bring luck.",
    },
  ],
  templateSlug: "split-4-days-itinerary",
  templateTitle:
    "Split in 4 days: Diocletian's Palace, the islands and Hvar",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
