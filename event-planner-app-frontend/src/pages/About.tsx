import React from "react";
import {
  Map,
  Users,
  Search,
  Brain,
  ShieldCheck,
  Download,
  Sparkles,
  MessageSquareText,
  CalendarSync,
  Plane,
  Wallet,
  LayoutTemplate,
} from "lucide-react";

const SCREENSHOTS = [
  {
    src: "/screenshots/triptrack-calendar.png",
    alt: "A month calendar of a Lisbon trip beside a map of the planned places.",
    caption: "The trip schedule as a calendar, next to its places on the map.",
  },
  {
    src: "/screenshots/triptrack-ai-proposals.png",
    alt: "A dialog titled Review proposed changes listing four suggested events, each with a checkbox, and buttons to reject all or apply the selected changes.",
    caption: "AI suggestions are reviewed first and only apply once you approve them.",
  },
  {
    src: "/screenshots/triptrack-day-optimiser.png",
    alt: "A dialog titled Optimise your days where the user picks which days to improve and priorities such as minimising travel.",
    caption: "The day optimiser asks what to improve, then proposes changes to review.",
  },
  {
    src: "/screenshots/triptrack-expenses.png",
    alt: "A budget with spending by category, the group's balances, and suggested payments to settle up.",
    caption: "Spending against a budget, with suggested payments to settle up.",
  },
  {
    src: "/screenshots/triptrack-flights.png",
    alt: "A saved flight showing departure and arrival airports and times, price and a book button.",
    caption: "Saved flights sit in the trip, with times, price and a link to book.",
  },
  {
    src: "/screenshots/triptrack-routes.png",
    alt: "A day's events with a walking route drawn on the map between two of them and step-by-step directions below.",
    caption: "Routes between events are drawn on the map, with walking or transit directions.",
  },
] as const;

export default function AboutPage() {
  const FEATURES = [
    {
      icon: <Sparkles className="text-brand-primary" size={28} />,
      title: "AI Trip Generator",
      description:
        "Turn a single sentence into a complete trip plan in seconds. Describe where you want to go and what you enjoy, and the AI builds the itinerary for you.",
    },
    {
      icon: <MessageSquareText className="text-brand-primary" size={28} />,
      title: "AI Trip Editing",
      description:
        "Change your plan just by asking, whether that's moving a dinner or adding a day. Every AI change is shown for your review before it's applied, so you stay in control.",
    },
    {
      icon: <Brain className="text-brand-primary" size={28} />,
      title: "Smart Planning",
      description:
        "Fill empty hours with ideas, fix timing clashes and draft packing lists in one step. Every suggestion waits for your approval, so nothing changes without you.",
    },
    {
      icon: <Users className="text-brand-primary" size={28} />,
      title: "Realtime Collaboration",
      description:
        "Everyone in your group sees changes the moment they happen, on every device. No more chasing the latest version through a group chat.",
    },
    {
      icon: <CalendarSync className="text-brand-primary" size={28} />,
      title: "Google Calendar Sync",
      description:
        "Keep each trip in step with Google Calendar, with changes flowing both ways. The whole group always has the right plan in their own calendar.",
    },
    {
      icon: <Plane className="text-brand-primary" size={28} />,
      title: "Flight Search",
      description:
        "Search for flights without leaving your trip and keep each one beside your itinerary. Arrival times and plans stay lined up in one place.",
    },
    {
      icon: <Map className="text-brand-primary" size={28} />,
      title: "Map & Calendar View",
      description:
        "See your schedule and your map on one clean screen. You'll know exactly where to be and how to get there without switching apps.",
    },
    {
      icon: <Wallet className="text-brand-primary" size={28} />,
      title: "Budget & Expenses",
      description:
        "Track what everyone spends, split costs and settle up in a few clicks. No awkward maths and no chasing friends for money.",
    },
    {
      icon: <LayoutTemplate className="text-brand-primary" size={28} />,
      title: "Trip Templates",
      description:
        "Start from a premade destination template and make it yours in seconds. Skip the blank page and get planning straight away.",
    },
    {
      icon: <Search className="text-brand-primary" size={28} />,
      title: "Google Event Search",
      description:
        "Find restaurants, museums and hidden landmarks using Google's database. Add the spots you love to your trip with a single click.",
    },
    {
      icon: <ShieldCheck className="text-brand-primary" size={28} />,
      title: "Admin & Viewer Roles",
      description:
        "Stay in control of who changes what. Give co-planners full editing rights, or let others follow the plan without altering it.",
    },
    {
      icon: <Download className="text-brand-primary" size={28} />,
      title: "Calendar & Word Export",
      description:
        "Take your plans anywhere with an .ics file for any calendar app. Or download the whole trip as a Word document to share.",
    },
  ];

  return (
    <div className="container flex flex-col gap-6 py-10">
      <section className="text-center mb-16 px-2 md:px-0">
        <h1 className="text-5xl font-extrabold text-text-primary mb-6 tracking-tight">
          Travel planning,{" "}
          <span className="text-brand-primary">simplified.</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          We built TripTrack to get rid of messy spreadsheets and endless tabs.
          It's one place to plan your route, share the plan with friends, and
          let AI handle the boring bits.
        </p>
      </section>

      <h2 className="text-3xl font-bold text-text-primary mb-10 text-left border-b border-surface-border pb-4 px-2 md:px-0">
        Why use TripTrack?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          See it in action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCREENSHOTS.map((shot) => (
            <figure key={shot.src} className="m-0">
              <img
                src={shot.src}
                alt={shot.alt}
                width={1600}
                height={1000}
                loading="lazy"
                className="w-full h-auto rounded-2xl border border-surface-border"
              />
              <figcaption className="mt-2 text-sm text-text-secondary">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="card p-8 bg-surface rounded-2xl shadow-sm border border-surface-border">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              How it&apos;s built
            </h2>
            <p className="text-text-secondary leading-relaxed text-lg">
              TripTrack is a <strong>React and TypeScript</strong> app talking
              to a <strong>Python and Flask</strong> API and a{" "}
              <strong>PostgreSQL</strong> database. When someone saves a
              change, the server tells everyone else viewing that trip, and AI
              suggestions only become part of the plan once a person approves
              them.{" "}
              <a
                href="https://github.com/Akhere-G/event-planner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary underline"
              >
                See the code on GitHub
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
            {[
              "React",
              "Python",
              "Flask",
              "PostgreSQL",
              "Google Maps",
              "Gemini",
            ].map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 bg-brand/5 text-brand-primary text-xs font-bold rounded-md border border-brand/10 uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <h2 className="text-3xl font-bold text-text-primary mb-10 text-left border-b border-surface-border pb-4 px-2 md:px-0">
        Contact Us
      </h2>
      <p>
        Contact us at{" "}
        <a href="mailto:101akhere5@gmail.com">101akhere5@gmail.com</a> if you
        have any questions, queries or requests.
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-8 bg-surface rounded-2xl shadow-sm border border-surface-border hover:border-brand/40 transition-all">
      <div className="mb-5 p-3 bg-brand/5 rounded-xl w-fit group-hover:bg-brand/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
