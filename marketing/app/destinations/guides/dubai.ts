import type { DestinationGuide } from "../types";

export const dubaiGuide: DestinationGuide = {
  slug: "dubai-travel-guide",
  city: "Dubai",
  country: "United Arab Emirates",
  region: "Middle East & Africa",
  image: {
    src: "https://images.unsplash.com/photo-1682410601760-6372fd33ad2b?auto=format&fit=crop&w=1600&q=80",
    alt: "An aerial view of the towers of Dubai Marina beside the sea",
    width: 1600,
    height: 1200,
    credit: {
      name: "Jhonwayne Pumaras",
      url: "https://unsplash.com/photos/qByXClNnygI",
      source: "Unsplash",
    },
  },
  title: "Dubai Travel Guide: Skyline, Desert and Where to Eat and Stay",
  description:
    "A practical Dubai guide for groups: the Burj Khalifa and old Dubai, desert trips, beach clubs and brunches, where to eat, where to stay and quieter corners, with a 5-day itinerary.",
  intro: [
    "Dubai is a city of superlatives, from the world's tallest building to vast malls and man-made islands. For groups from the UK it has become a favourite for winter sun, milestone birthdays and luxury hen dos, thanks to direct flights, guaranteed sunshine for much of the year and a famous brunch culture.",
    "Behind the skyline there is more to explore. The creek-side neighbourhoods of Deira and Al Fahidi show old Dubai's trading roots, with abra water taxis, spice and gold souks and wind-tower houses. And just beyond the city, the desert offers dune drives, camel rides and dinner under the stars.",
    "Below you will find places to eat, things to do, where to stay and some less obvious corners. The linked 5-day itinerary mixes the big sights, a desert safari, beach-club days and old Dubai, and you can copy it into your own trip and adjust it.",
  ],
  bestTime:
    "November to March is the best time to visit, with warm, sunny days and pleasant evenings. April and October are hot but manageable. From May to September temperatures regularly pass 40°C, which makes outdoor sightseeing hard, though hotel prices drop. Dates change each year for Ramadan, when some restaurants keep shorter hours in daytime; check before you book.",
  restaurants: [
    {
      name: "Al Ustad Special Kebab",
      area: "Bur Dubai",
      description:
        "A family-run kebab house open since the 1970s, loved for simple grilled meats and rice. Cheap and cheerful.",
    },
    {
      name: "Ravi Restaurant",
      area: "Satwa",
      description:
        "A legendary, inexpensive Pakistani canteen open late, famous for its curries and breads.",
    },
    {
      name: "Arabian Tea House",
      area: "Al Fahidi",
      description:
        "A courtyard café in the historic district serving Emirati breakfasts and dishes.",
    },
    {
      name: "Pierchic",
      area: "Umm Suqeim",
      description:
        "A seafood restaurant at the end of a pier with views of the Burj Al Arab. Book for sunset.",
    },
    {
      name: "Time Out Market Dubai",
      area: "Downtown",
      description:
        "A food hall with stalls from local chefs, good when a group wants different things.",
    },
    {
      name: "Friday brunch",
      area: "Hotels across the city",
      description:
        "Dubai's famous all-you-can-eat-and-drink brunches run on Fridays and Saturdays at many hotels. Book ahead and check the dress code.",
    },
  ],
  thingsToDo: [
    {
      name: "Burj Khalifa",
      area: "Downtown",
      description:
        "Ride up the world's tallest building for views over the city. Book a sunset slot ahead.",
    },
    {
      name: "Dubai Fountain",
      area: "Downtown",
      description:
        "Free evening shows of water, music and light on the lake below the Burj Khalifa.",
    },
    {
      name: "Desert safari",
      area: "Outside the city",
      description:
        "Dune drives, sandboarding, camel rides and dinner at a desert camp. Choose an operator with good safety reviews.",
    },
    {
      name: "Al Fahidi and the abra crossing",
      area: "Old Dubai",
      description:
        "Wander the wind-tower lanes, then cross the creek by abra water taxi for a few dirhams.",
    },
    {
      name: "Gold and spice souks",
      area: "Deira",
      description:
        "Traditional markets across the creek. Haggle politely.",
    },
    {
      name: "JBR beach and The Walk",
      area: "Dubai Marina",
      description:
        "A long public beach with a promenade of restaurants below the marina towers.",
    },
    {
      name: "Atlantis Aquaventure",
      area: "Palm Jumeirah",
      description:
        "A giant water park at the tip of the Palm with record-breaking slides.",
    },
    {
      name: "Museum of the Future",
      area: "Sheikh Zayed Road",
      description:
        "A striking torus-shaped building with immersive exhibitions about the future.",
    },
  ],
  whereToStay: [
    {
      name: "Atlantis The Palm",
      area: "Palm Jumeirah",
      description:
        "A huge resort with a water park and aquarium. Suits groups who want everything on site.",
    },
    {
      name: "Address Downtown",
      area: "Downtown",
      description:
        "A luxury hotel next to the Burj Khalifa and the fountains. Suits a city-focused trip.",
    },
    {
      name: "Rove Downtown",
      area: "Downtown",
      description:
        "A stylish, good-value hotel with a pool and views of the Burj Khalifa. Suits groups on a budget.",
    },
    {
      name: "JA Ocean View Hotel",
      area: "JBR",
      description:
        "A beachfront hotel on The Walk at JBR. Suits groups who want the beach and Marina nightlife.",
    },
  ],
  hiddenGems: [
    {
      name: "Alserkal Avenue",
      area: "Al Quoz",
      description:
        "Converted warehouses filled with art galleries, cafés and independent shops.",
    },
    {
      name: "Al Shindagha Museum",
      area: "Bur Dubai",
      description:
        "A museum quarter on the creek telling the story of Dubai, including a perfume house.",
    },
    {
      name: "Hatta",
      area: "Hajar Mountains",
      description:
        "A mountain enclave about 90 minutes away with kayaking on a dam lake and hiking trails.",
    },
    {
      name: "Al Qudra Lakes",
      area: "Desert",
      description:
        "Man-made lakes in the desert, popular for sunset picnics and stargazing.",
    },
  ],
  templateSlug: "dubai-5-days-itinerary",
  templateTitle:
    "Dubai in 5 days: Burj Khalifa, desert safari and old Dubai",
  templateDays: 5,
  publishedAt: "2026-11-22",
};
