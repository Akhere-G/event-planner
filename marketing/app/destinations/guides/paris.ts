import type { DestinationGuide } from "../types";

export const parisGuide: DestinationGuide = {
  slug: "paris-travel-guide",
  city: "Paris",
  country: "France",
  region: "Europe",
  title: "Paris Travel Guide: Where to Eat, Stay and What to See",
  description:
    "Plan Paris with confidence: bistros worth booking, the museums and landmarks that deserve your time, where to stay and a few quieter corners locals love.",
  intro: [
    "Paris rewards a slower plan than most first-time visitors make. The big sights are close together, but the city is at its best between them: a market lunch, a courtyard you wander into, a bistro that has been serving the same duck for decades.",
    "This guide covers the restaurants, sights, hotels and quieter spots we would build a trip around, grouped by area so you can avoid zig-zagging across the Seine. Everything here is also in our four-day Paris itinerary, which you can copy into your own trip and change.",
  ],
  bestTime:
    "April to June and September to October are the easiest months: mild days, long light and open terraces, without the peak heat of July and August. Summer is lively, but it can be hot in the museums and some small restaurants close for part of August, so check before you plan around one. Winter is cold and grey but quieter, with shorter queues at the major sights and cosy bistro menus.",
  restaurants: [
    {
      name: "Chez Janou",
      area: "Le Marais",
      description:
        "A busy Provençal bistro near the Place des Vosges with a long list of pastis. Order a Provençal main and finish with the shared bowl of chocolate mousse.",
    },
    {
      name: "Allard",
      area: "Saint-Germain-des-Prés",
      description:
        "A traditional bistro recognised by the Michelin Guide. Come for French classics such as frogs' legs and roast duck in an old-fashioned dining room.",
    },
    {
      name: "Le Comptoir du Relais",
      area: "Saint-Germain-des-Prés",
      description:
        "Yves Camdeborde's much-loved bistro on the Carrefour de l'Odéon, known for its onion soup and generous plates. Book well ahead for dinner, or try for lunch.",
    },
    {
      name: "Bouillon Chartier",
      area: "Grands Boulevards",
      description:
        "A grand belle-époque dining hall serving simple French staples at friendly prices. Expect a queue and shared tables, and plan to be quick.",
    },
    {
      name: "Le Coq & Fils",
      area: "Montmartre",
      description:
        "Antoine Westermann's poultry-focused bistro on the Rue Lepic, formerly called Le Coq Rico. The roast bird is the dish to order.",
    },
    {
      name: "Juvéniles",
      area: "Palais-Royal",
      description:
        "A long-standing wine bar a short walk from the Louvre, with a changing bistro menu and a good by-the-glass list. A relaxed lunch stop between museums.",
    },
    {
      name: "L'Ami Jean",
      area: "7th arrondissement",
      description:
        "Stéphane Jégo's Basque-influenced bistro near the Eiffel Tower, known for hearty cooking and its rice pudding dessert. Book ahead.",
    },
    {
      name: "Bouillon Racine",
      area: "Latin Quarter",
      description:
        "A listed Art Nouveau brasserie from 1906 with mosaic floors and carved wood, serving traditional French dishes near the Sorbonne.",
    },
  ],
  thingsToDo: [
    {
      name: "Sainte-Chapelle",
      area: "Île de la Cité",
      description:
        "A 13th-century royal chapel whose upper level is lined with tall stained-glass windows. Book a timed ticket and go early or late for the best light.",
    },
    {
      name: "Notre-Dame de Paris",
      area: "Île de la Cité",
      description:
        "The restored cathedral and its parvis. Even from outside, the carved west front and flying buttresses are worth the walk along the river.",
    },
    {
      name: "Musée du Louvre",
      area: "1st arrondissement",
      description:
        "Too big to see in one visit. Choose a few rooms, such as the Mona Lisa, the Greek and Roman sculpture and the Egyptian galleries, and pre-book a time slot.",
    },
    {
      name: "Musée d'Orsay",
      area: "7th arrondissement",
      description:
        "Impressionist and post-Impressionist paintings in a former railway station. Walk there through the Tuileries gardens and across the river.",
    },
    {
      name: "Sacré-Cœur and Montmartre",
      area: "Montmartre",
      description:
        "Climb to the white basilica for views across the city, then wander the village-like lanes behind it. Go early to avoid the crowds on the steps.",
    },
    {
      name: "Musée Picasso",
      area: "Le Marais",
      description:
        "A large collection of Picasso's paintings, sculpture and sketchbooks in a 17th-century mansion, arranged so you can follow his career.",
    },
    {
      name: "Musée Rodin",
      area: "7th arrondissement",
      description:
        "Rodin's best-known sculptures, including The Thinker, set in a mansion and a quiet rose garden. The garden is a calm break from the big museums.",
    },
    {
      name: "Eiffel Tower and the Seine",
      area: "Champ de Mars",
      description:
        "Go up if you have pre-booked tickets, or picnic on the Champ de Mars and finish with a one-hour river cruise from the foot of the tower.",
    },
  ],
  whereToStay: [
    {
      name: "Hôtel Jeanne d'Arc Le Marais",
      area: "Le Marais",
      description:
        "A well-reviewed three-star hotel on a quiet street near the Place des Vosges. It suits first-timers who want to walk to the Marais, Notre-Dame and the Bastille.",
    },
    {
      name: "Hôtel Turenne Le Marais",
      area: "Le Marais",
      description:
        "A modern, clean mid-range hotel in a handy Marais location. A good choice for couples and solo travellers who want simple comfort and an easy walk to the sights.",
    },
    {
      name: "Hôtel Henri IV Rive Gauche",
      area: "Latin Quarter",
      description:
        "Classic Parisian style, steps from Notre-Dame. Suits visitors who prefer the Left Bank and want a simple, traditional base.",
    },
    {
      name: "Hôtel Saint-Jacques",
      area: "Latin Quarter",
      description:
        "A budget-friendly hotel with Belle Époque decor near the Sorbonne and the Luxembourg Gardens. A good pick for students and anyone watching costs.",
    },
    {
      name: "Le Pavillon de la Reine",
      area: "Place des Vosges",
      description:
        "A luxury hotel behind the Place des Vosges, with a quiet courtyard garden. Suits couples and anyone marking a special occasion.",
    },
  ],
  hiddenGems: [
    {
      name: "Galerie Vivienne and Passage des Panoramas",
      area: "2nd arrondissement",
      description:
        "Two 19th-century covered passages with tiled floors, glass roofs, bookshops and tea rooms. They are a calm, dry place to wander on a wet afternoon.",
    },
    {
      name: "Musée de la Vie romantique",
      area: "9th arrondissement",
      description:
        "A small museum in a pretty 1830 house with a courtyard garden and tea room, devoted to the Romantic era and George Sand.",
    },
    {
      name: "Parc des Buttes-Chaumont",
      area: "19th arrondissement",
      description:
        "A hilly 19th-century park with a lake, cliffs and a hilltop temple. Locals come here for picnics and views away from the centre.",
    },
    {
      name: "Coulée verte René-Dumont",
      area: "12th arrondissement",
      description:
        "An elevated garden walkway on a former railway viaduct, running east from near Bastille above the rooftops, with craft studios beneath it.",
    },
    {
      name: "Rue Crémieux",
      area: "12th arrondissement",
      description:
        "A short pedestrian street of pastel-painted houses near the Gare de Lyon. Visit early in the day, and keep your voice down for the residents.",
    },
  ],
  templateSlug: "paris-4-days-itinerary",
  templateTitle: "Paris in 4 days: art, food and hidden corners",
  templateDays: 4,
  publishedAt: "2026-11-11",
};
