import type { DestinationGuide } from "../types";

export const mykonosGuide: DestinationGuide = {
  slug: "mykonos-travel-guide",
  city: "Mykonos",
  country: "Greece",
  region: "Europe",
  image: {
    src: "https://images.unsplash.com/photo-1657141462746-13f0468d5e65?auto=format&fit=crop&w=1600&q=80",
    alt: "The whitewashed windmills of Kato Mili above Mykonos Town and the Aegean",
    width: 1600,
    height: 1354,
    credit: {
      name: "Julian",
      url: "https://unsplash.com/photos/Z8T3xS4_vT0",
      source: "Unsplash",
    },
  },
  title: "Mykonos Travel Guide: Beaches, Little Venice and Where to Eat",
  description:
    "A practical Mykonos guide for groups: the best beaches and beach clubs, sunset in Little Venice, where to eat, where to stay by budget and quieter corners, with a 4-day itinerary.",
  intro: [
    "Mykonos is small enough to cross in half an hour, yet it packs in a whitewashed maze of a town, some of the most famous beach clubs in Europe and a scattering of quiet coves that most visitors never reach. It is a glamorous island and it prices itself that way, so a little planning goes a long way.",
    "Mykonos Town, also called Chora, is where most evenings start: cocktails in Little Venice, a walk past the windmills, then dinner in the lanes. By day the action moves to the south coast beaches, from family-friendly Ornos and Platis Gialos to the party beaches of Paradise and Super Paradise.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 4-day itinerary paces the island with a boat trip to ancient Delos, beach days and one proper night out, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "June and September are the best months for most groups: hot, sunny and lively, without the peak crowds and prices of July and August. Late May and early October are calmer and cheaper, though some beach clubs keep shorter hours. Mykonos is windy in summer, when the meltemi wind blows, so north-facing beaches can be rough while the south coast stays sheltered. Most of the island shuts from November to April.",
  restaurants: [
    {
      name: "Kiki's Tavern",
      area: "Agios Sostis",
      description:
        "A tiny grill above a quiet beach with no electricity and no bookings. Expect to queue with a drink, and it is worth it.",
    },
    {
      name: "Kounelas",
      area: "Mykonos Town",
      description:
        "A simple fish taverna in the lanes near the old port, with grilled catch of the day and a courtyard. Good value for Mykonos.",
    },
    {
      name: "Niko's Taverna",
      area: "Mykonos Town",
      description:
        "A long-running taverna near the old port serving Greek classics in generous portions, popular for a late lunch.",
    },
    {
      name: "M-Eating",
      area: "Mykonos Town",
      description:
        "Modern Greek cooking on Kalogera street, using island ingredients. Book for a celebratory dinner.",
    },
    {
      name: "Nammos",
      area: "Psarou",
      description:
        "The island's most famous beach restaurant and club. Lavish and expensive, best for a once-only splurge. Book ahead.",
    },
    {
      name: "Fokos Taverna",
      area: "Fokos",
      description:
        "A remote taverna on a wild northern beach, serving home-style dishes. The drive is part of the appeal.",
    },
  ],
  thingsToDo: [
    {
      name: "Little Venice",
      area: "Mykonos Town",
      description:
        "Old captains' houses with balconies hanging over the sea. Find a bar here for sunset drinks, and expect the splash of waves.",
    },
    {
      name: "Kato Mili windmills",
      area: "Mykonos Town",
      description:
        "The island's famous row of windmills on the ridge above Little Venice, best in the soft light before sunset.",
    },
    {
      name: "Delos",
      area: "Boat from the old port",
      description:
        "A short boat ride to the sacred island of Apollo, one of Greece's great archaeological sites. Closed on some Mondays, so check before you go.",
    },
    {
      name: "Church of Paraportiani",
      area: "Mykonos Town",
      description:
        "A cluster of whitewashed chapels joined into one sculptural church, a symbol of the island.",
    },
    {
      name: "Psarou and Platis Gialos",
      area: "South coast",
      description:
        "Sheltered sandy beaches with sunbeds and tavernas, linked to town by bus and sea taxi.",
    },
    {
      name: "Paradise and Super Paradise",
      area: "South coast",
      description:
        "The party beaches, with DJs, dancing and beach clubs that stay busy into the night in peak season.",
    },
    {
      name: "Ano Mera",
      area: "Inland",
      description:
        "The island's second village, with a main square of tavernas and the Panagia Tourliani monastery.",
    },
    {
      name: "Armenistis Lighthouse",
      area: "North-west",
      description:
        "A quiet headland with a view across to Tinos, good for an early-evening drive.",
    },
  ],
  whereToStay: [
    {
      name: "Belvedere Hotel",
      area: "Mykonos Town",
      description:
        "A stylish hotel on the edge of town with a pool and sea views. Suits groups who want to walk to dinner and bars.",
    },
    {
      name: "Hotel Philippi",
      area: "Mykonos Town",
      description:
        "A small, simple hotel in the middle of Chora around a garden courtyard. Suits travellers on a tighter budget.",
    },
    {
      name: "Kivotos Mykonos",
      area: "Ornos",
      description:
        "A luxury hotel above Ornos bay with a private beach. Suits a special-occasion trip.",
    },
    {
      name: "Mykonos Blu",
      area: "Psarou",
      description:
        "A resort above Psarou beach, a short walk from Nammos. Suits groups who want beach-club days without the commute.",
    },
  ],
  hiddenGems: [
    {
      name: "Agios Sostis beach",
      area: "North coast",
      description:
        "An undeveloped beach with no sunbeds, home to Kiki's Tavern. Bring your own shade.",
    },
    {
      name: "Panagia Tourliani Monastery",
      area: "Ano Mera",
      description:
        "A 16th-century monastery with an ornate carved wooden iconostasis in a peaceful village square.",
    },
    {
      name: "Kapari beach",
      area: "South-west coast",
      description:
        "A small cove near Agios Ioannis with a sunset view, reached down a rough track. Quiet even in high season.",
    },
    {
      name: "Lia beach",
      area: "East coast",
      description:
        "A long, clean beach at the far eastern end of the island with a good taverna and fewer crowds.",
    },
  ],
  templateSlug: "mykonos-4-days-itinerary",
  templateTitle:
    "Mykonos in 4 days: Little Venice, Delos and the south-coast beaches",
  templateDays: 4,
  publishedAt: "2026-11-22",
};
