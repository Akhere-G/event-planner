export interface FaqEntry {
  question: string;
  answer: string;
  featureSlugs: string[];
}

export interface FaqGroup {
  id: string;
  title: string;
  entries: FaqEntry[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    entries: [
      {
        question: "What is TripTrack?",
        answer:
          "TripTrack is a web-based trip planner for groups. It keeps the itinerary, map, accommodation, flights, packing and shared costs for a trip in one place, so the organiser isn't managing everything from a group chat.",
        featureSlugs: ["collaboration-roles", "group-expenses"],
      },
      {
        question: "Who is TripTrack for?",
        answer:
          "Anyone organising a trip with other people: city breaks with friends, stag and hen dos, milestone birthdays and family weekends away. It works for solo trips too, but most features are built around planning together.",
        featureSlugs: ["collaboration-roles", "wishlist-voting"],
      },
      {
        question: "How do I start a trip?",
        answer:
          "Describe the trip in a sentence and let TripTrack draft a plan, fill in the step-by-step form, or copy a published template and choose your dates.",
        featureSlugs: ["ai-trip-generator", "trip-templates-export"],
      },
      {
        question: "Do I need an account?",
        answer:
          "You can start a trip before you register. You'll need an account to keep the trip, join a trip from an invite, copy a template or connect Google Calendar.",
        featureSlugs: ["ai-trip-generator", "trip-templates-export"],
      },
      {
        question: "Is there a TripTrack app for my phone?",
        answer:
          "TripTrack runs in your web browser on phones, tablets and computers. There isn't a native app to download, and it needs an internet connection: there's no offline mode.",
        featureSlugs: [],
      },
    ],
  },
  {
    id: "group-planning",
    title: "Group planning",
    entries: [
      {
        question: "How do I invite friends to a trip?",
        answer:
          "Open the trip's members list and invite people by email. They accept the invite after signing in or creating an account.",
        featureSlugs: ["collaboration-roles"],
      },
      {
        question: "What can admins, editors and viewers do?",
        answer:
          "Admins manage the trip and its members. Editors add and change plans. Viewers can see the trip and vote on wishlist ideas but can't edit the plan.",
        featureSlugs: ["collaboration-roles"],
      },
      {
        question: "Do changes show up for everyone straight away?",
        answer:
          "Yes. When someone saves a change, other members' screens refresh. If two people change the same item, the most recent save wins.",
        featureSlugs: ["collaboration-roles"],
      },
      {
        question: "How does the group decide what to do?",
        answer:
          "Add ideas to a wishlist and let everyone vote thumbs up or down. Promote the winners to the itinerary with a start and end time.",
        featureSlugs: ["wishlist-voting", "google-maps-place-search"],
      },
      {
        question: "Can I see the plan on a map?",
        answer:
          "Yes. Events, accommodation and wishlist places appear as pins on the trip map, and you can view directions between stops by walking, driving or public transport.",
        featureSlugs: ["google-maps-place-search", "directions"],
      },
    ],
  },
  {
    id: "ai-and-proposals",
    title: "AI and proposals",
    entries: [
      {
        question: "Will the AI change my trip without asking?",
        answer:
          "No. Every AI result is a proposal showing what would be added, changed or removed. You approve every change, and nothing is saved until you apply it.",
        featureSlugs: ["ai-proposals"],
      },
      {
        question: "What can the AI help with?",
        answer:
          "Drafting a whole trip from a sentence, filling a day with ideas, optimising days around your goals, suggesting packing items and making edits you describe in plain English.",
        featureSlugs: [
          "ai-trip-generator",
          "fill-in-my-day",
          "smart-day-optimiser",
          "ai-proposals",
        ],
      },
      {
        question: "How long do AI suggestions take?",
        answer:
          "Longer tasks run in the background while you keep planning, and you'll get a notification when they're ready. Ready proposals expire after seven days.",
        featureSlugs: ["ai-proposals"],
      },
      {
        question: "Are AI suggestions always accurate?",
        answer:
          "No. Suggestions can include closed venues or out-of-date details. TripTrack checks things like times and flight clashes, but check opening hours and prices before you go.",
        featureSlugs: ["ai-proposals", "smart-day-optimiser"],
      },
    ],
  },
  {
    id: "money",
    title: "Money",
    entries: [
      {
        question: "How does expense splitting work?",
        answer:
          "Record who paid, the amount and how to split it: evenly between everyone, between selected people, or not at all. TripTrack works out each person's balance and suggests who should pay whom.",
        featureSlugs: ["group-expenses"],
      },
      {
        question: "Which currency are balances in?",
        answer:
          "Balances and repayments are in GBP. You can record a cost in the currency you paid, and TripTrack converts it to pounds using a published reference rate for the spending date, which may differ from your card's rate.",
        featureSlugs: ["group-expenses"],
      },
      {
        question: "Does TripTrack send or collect money?",
        answer:
          "No. TripTrack doesn't move money. Pay each other through your bank or payment app, then record the payment so the balances update.",
        featureSlugs: ["group-expenses"],
      },
      {
        question: "Can I book flights or hotels in TripTrack?",
        answer:
          "No. You can search flights, save flight details and add accommodation you've booked, but bookings and payments happen outside TripTrack.",
        featureSlugs: ["flight-search", "accommodation"],
      },
    ],
  },
  {
    id: "calendars-and-flights",
    title: "Calendars and flights",
    entries: [
      {
        question: "Can I sync a trip with Google Calendar?",
        answer:
          "Yes. Connect Google Calendar in Settings, then turn on sync for a trip. TripTrack creates a separate calendar for that trip and keeps events and flights in step.",
        featureSlugs: ["google-calendar-sync"],
      },
      {
        question: "What happens if a trip is edited in TripTrack and Google Calendar at once?",
        answer:
          "The most recent edit wins. TripTrack doesn't merge two versions of the same event.",
        featureSlugs: ["google-calendar-sync"],
      },
      {
        question: "Can I use Apple Calendar or Outlook?",
        answer:
          "Export the trip as an .ics file and import it. The export is a one-off copy, so it won't update when the trip changes.",
        featureSlugs: ["trip-templates-export", "trip-calendar"],
      },
      {
        question: "Does TripTrack track my flight?",
        answer:
          "No. TripTrack offers flight search and saved flight details, shown on the itinerary and calendar. It doesn't send delay or gate-change alerts.",
        featureSlugs: ["flight-search"],
      },
    ],
  },
  {
    id: "privacy-and-accounts",
    title: "Privacy and accounts",
    entries: [
      {
        question: "Who can see my trip?",
        answer:
          "Only the people you invite. Your trip becomes public only if an admin publishes it as a template, and templates leave out members, expenses, payments, flights and personal packing items.",
        featureSlugs: ["collaboration-roles", "trip-templates-export"],
      },
      {
        question: "Can other members see my packing list?",
        answer:
          "Items in My Items are private to you. Items in Group Gear are shared with everyone on the trip.",
        featureSlugs: ["packing-lists"],
      },
      {
        question: "What access does Google Calendar sync need?",
        answer:
          "Access only to calendars TripTrack creates. It can't read or change your existing calendars, and turning sync off leaves the trip calendar for you to keep or delete.",
        featureSlugs: ["google-calendar-sync"],
      },
      {
        question: "Does TripTrack use analytics cookies?",
        answer:
          "Only if you agree. You can change your choice at any time from the cookie settings link.",
        featureSlugs: [],
      },
    ],
  },
];
