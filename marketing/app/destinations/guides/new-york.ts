import type { DestinationGuide } from "../types";

export const newYorkGuide: DestinationGuide = {
  slug: "new-york-travel-guide",
  city: "New York",
  country: "USA",
  region: "North America",
  title: "New York Travel Guide: Where to Eat, Stay and What to See",
  description:
    "Plan New York with this guide to classic restaurants, where to stay in Manhattan and Brooklyn, the sights worth your time and quieter spots beyond the crowds.",
  intro: [
    "New York is easiest when you plan by neighbourhood. A day in Lower Manhattan, one in Midtown, one in the Village and Chelsea, another in Brooklyn: the subway connects them, but each area works as a morning of walking.",
    "Eating is half the itinerary. Katz's pastrami, a dumpling counter in Chinatown, a coal-oven pie in DUMBO and a steak in Williamsburg are all long-standing New York experiences, and they sit near the sights, so you can fold them into the day.",
    "Book the big-ticket items ahead, including the Statue of Liberty ferry, observation decks and any show, and leave time in between to walk. This guide covers where to eat, where to stay, what to see and a few places that most visitors skip.",
  ],
  bestTime:
    "Spring (April to early June) and autumn (September to early November) are the most comfortable, with mild days and good walking weather. Summer is hot and humid, and winter is cold, though the holiday season brings decorations and a festive atmosphere. Pack layers whichever month you go.",
  restaurants: [
    {
      name: "Katz's Delicatessen",
      area: "Lower East Side",
      description:
        "A historic deli, open since 1888, famous for hand-carved pastrami on rye. Hold on to your ticket and tip the carver.",
    },
    {
      name: "Russ & Daughters Cafe",
      area: "Lower East Side",
      description:
        "Smoked salmon, bagels and babka at a long-running appetising family business. The sit-down cafe is good for brunch.",
    },
    {
      name: "Joe's Pizza",
      area: "Greenwich Village and Midtown",
      description:
        "A classic New York slice joint, with the original on Carmine Street since 1975 and a branch on Broadway. Folded cheese or pepperoni slices make a fast stop between sights.",
    },
    {
      name: "Peter Luger Steak House",
      area: "Williamsburg, Brooklyn",
      description:
        "A steakhouse dating from 1887, known for its porterhouse for two. Reserve ahead.",
    },
    {
      name: "Juliana's Pizza",
      area: "DUMBO, Brooklyn",
      description:
        "Coal-oven pizza with thin crusts and a short list of toppings, a short walk from the Brooklyn Bridge.",
    },
    {
      name: "Joe's Shanghai",
      area: "Chinatown",
      description:
        "Soup dumplings filled with pork or crab and pork. Bite a small hole and sip the broth before eating the rest.",
    },
    {
      name: "Los Tacos No. 1",
      area: "Chelsea",
      description:
        "Tacos on handmade tortillas, including adobada from the spit and carne asada, inside the busy Chelsea Market.",
    },
    {
      name: "Red Rooster Harlem",
      area: "Harlem",
      description:
        "Marcus Samuelsson's restaurant serving soul-food-inspired American cooking, with fried chicken among the favourites.",
    },
  ],
  thingsToDo: [
    {
      name: "Statue of Liberty and Ellis Island",
      area: "Lower Manhattan",
      description:
        "Take the ferry from Battery Park to Liberty Island and Ellis Island. Book ahead and start early.",
    },
    {
      name: "9/11 Memorial and Museum",
      area: "Lower Manhattan",
      description:
        "Reflecting pools mark the footprints of the Twin Towers, with an underground museum. A sombre but worthwhile visit.",
    },
    {
      name: "The Metropolitan Museum of Art",
      area: "Upper East Side",
      description:
        "One of the world's largest art museums, spanning Egyptian temples to European paintings. Choose a few galleries rather than trying to see it all.",
    },
    {
      name: "Brooklyn Bridge walk to DUMBO",
      area: "Lower Manhattan and Brooklyn",
      description:
        "Walk the pedestrian promenade over the East River, then explore DUMBO's cobbled streets and waterfront. Go early for fewer crowds.",
    },
    {
      name: "The High Line",
      area: "Chelsea",
      description:
        "An elevated park on a former freight railway, with gardens and public art, running north to Hudson Yards.",
    },
    {
      name: "Grand Central Terminal and Top of the Rock",
      area: "Midtown",
      description:
        "See the star-painted ceiling in Grand Central, then book Top of the Rock for views of Central Park and the Empire State Building.",
    },
    {
      name: "Tenement Museum",
      area: "Lower East Side",
      description:
        "Guided tours of restored tenement apartments that tell the stories of immigrant families. Book a tour in advance.",
    },
    {
      name: "Village Vanguard",
      area: "Greenwich Village",
      description:
        "A historic basement jazz club. Check the line-up and book ahead.",
    },
  ],
  whereToStay: [
    {
      name: "Washington Square Hotel",
      area: "Greenwich Village",
      description:
        "A historic, well-reviewed hotel just off Washington Square Park. Suits first-timers who want a walkable, characterful base.",
    },
    {
      name: "Pod 39",
      area: "Murray Hill, Midtown",
      description:
        "A compact, budget-friendly hotel a short walk from Grand Central. Suits solo travellers and anyone who just needs a bed and a good location.",
    },
    {
      name: "The Standard, High Line",
      area: "Meatpacking District",
      description:
        "A design hotel beside the High Line and Whitney Museum. Suits travellers who want nightlife and a lively neighbourhood.",
    },
    {
      name: "Wythe Hotel",
      area: "Williamsburg, Brooklyn",
      description:
        "A converted factory hotel with Manhattan skyline views and short subway rides to the city. Suits travellers who want a Brooklyn base.",
    },
    {
      name: "The Plaza",
      area: "Midtown",
      description:
        "A landmark luxury hotel on Fifth Avenue, beside Central Park. Suits couples and anyone marking a special occasion.",
    },
  ],
  hiddenGems: [
    {
      name: "The Cloisters",
      area: "Fort Tryon Park, Manhattan",
      description:
        "The Met's medieval art museum, built from European monastery fragments, with herb gardens and Hudson River views.",
    },
    {
      name: "Green-Wood Cemetery",
      area: "Sunset Park, Brooklyn",
      description:
        "A hilly 19th-century cemetery with Victorian monuments, quiet paths and distant skyline views.",
    },
    {
      name: "The Morgan Library & Museum",
      area: "Murray Hill, Midtown",
      description:
        "J. P. Morgan's private library, with rare manuscripts and exhibitions, often overlooked in Midtown.",
    },
    {
      name: "Arthur Avenue Retail Market",
      area: "Belmont, the Bronx",
      description:
        "The heart of the Bronx's Little Italy, an indoor market with delis, bakeries and pasta shops.",
    },
  ],
  templateSlug: "new-york-1-week-itinerary",
  templateTitle:
    "New York in 1 week: classic sights, great food and Brooklyn views",
  templateDays: 7,
  publishedAt: "2026-11-11",
};
