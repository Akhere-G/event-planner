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

export default function AboutPage() {
  const FEATURES = [
    {
      icon: <Sparkles className="text-brand-primary" size={28} />,
      title: "AI Trip Generator",
      description: "Plan a whole trip from a single sentence.",
    },
    {
      icon: <MessageSquareText className="text-brand-primary" size={28} />,
      title: "AI Trip Editing",
      description:
        "Change your plan by just asking. Review every AI change before it's applied.",
    },
    {
      icon: <Brain className="text-brand-primary" size={28} />,
      title: "Smart Planning",
      description:
        "Fills empty time, fixes timing clashes and drafts packing lists. You approve every change.",
    },
    {
      icon: <Users className="text-brand-primary" size={28} />,
      title: "Realtime Collaboration",
      description:
        "Invite your group and everyone sees changes the moment they happen, on every device. No more chasing the latest version in a group chat.",
    },
    {
      icon: <CalendarSync className="text-brand-primary" size={28} />,
      title: "Google Calendar Sync",
      description:
        "Keep each trip in step with Google Calendar. Changes made on either side show up on the other, so the whole group always has the right plan.",
    },
    {
      icon: <Plane className="text-brand-primary" size={28} />,
      title: "Flight Search",
      description:
        "Search flights for your trip and keep them alongside your itinerary, so travel plans stay in one place.",
    },
    {
      icon: <Map className="text-brand-primary" size={28} />,
      title: "Map & Calendar View",
      description:
        "See your schedule and your map on one clean screen. No more switching between apps to work out where you need to be.",
    },
    {
      icon: <Wallet className="text-brand-primary" size={28} />,
      title: "Budget & Expenses",
      description:
        "Track what everyone spends, split costs and settle up in a few clicks, without the awkward maths.",
    },
    {
      icon: <LayoutTemplate className="text-brand-primary" size={28} />,
      title: "Trip Templates",
      description:
        "Start from premade destination templates and make them your own in seconds.",
    },
    {
      icon: <Search className="text-brand-primary" size={28} />,
      title: "Google Event Search",
      description:
        "Find restaurants, museums and hidden landmarks and add them to your trip with a single click.",
    },
    {
      icon: <ShieldCheck className="text-brand-primary" size={28} />,
      title: "Admin & Viewer Roles",
      description:
        "Stay in control. Give co-planners full editing rights, or let others follow the itinerary without changing it.",
    },
    {
      icon: <Download className="text-brand-primary" size={28} />,
      title: "Calendar & Word Export",
      description:
        "Take your plans anywhere. Export to your calendar app as an .ics file, or download the whole trip as a Word document.",
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
          It's one place to plan your route, chat with friends, and let AI
          handle the boring bits.
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

      <section className="card p-8 bg-surface rounded-2xl shadow-sm border border-surface-border">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Built by travellers, for travellers
            </h2>
            <p className="text-text-secondary leading-relaxed text-lg">
              TripTrack is a modern web app built with{" "}
              <strong>React and TypeScript</strong>. On the frontend, we use{" "}
              <strong>Redux</strong> to keep your trip details in sync and{" "}
              <strong>Yup</strong> to make sure your data is valid before it
              even leaves your browser. Our <strong>Python and Flask</strong>{" "}
              backend handles the heavy lifting, using{" "}
              <strong>SQLAlchemy</strong> to manage our database and{" "}
              <strong>Marshmallow</strong> to keep our API communication clean
              and reliable. Combined with <strong>Google Maps</strong>, this
              setup ensures your day-planning and route optimisations happen in
              seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
            {[
              "React",
              "Python",
              "Flask",
              "Google Maps",
              "Gemini",
              "SQLAlchemy",
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
