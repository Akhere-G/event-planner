import React from "react";
import {
  Map,
  Sparkles,
  Users,
  Search,
  Brain,
  ShieldCheck,
  Navigation,
  Download,
} from "lucide-react";

export default function AboutPage() {
  const FEATURES = [
    {
      icon: <Map className="text-brand-primary" size={28} />,
      title: "Map & Calendar View",
      description:
        "See your schedule and your map on one screen. No more jumping between apps to figure out where you need to be.",
    },
    {
      icon: <Brain className="text-brand-primary" size={28} />,
      title: "AI Plan Day",
      description:
        "Stuck for ideas? Our AI instantly fills your day with smart suggestions, taking the guesswork out of planning your itinerary.",
    },
    {
      icon: <Sparkles className="text-brand-primary" size={28} />,
      title: "AI Optimise Day",
      description:
        "Our AI reorders your events to fix timing clashes and group nearby spots together, so you spend less time travelling and more time exploring.",
    },
    {
      icon: <Users className="text-brand-primary" size={28} />,
      title: "Seamless Collaboration",
      description:
        "Onboard your group in seconds. Simply share a secure link and start planning together—no more back-and-forth in the group chat.",
    },
    {
      icon: <ShieldCheck className="text-brand-primary" size={28} />,
      title: "Admin & Viewer Roles",
      description:
        "Stay in control by assigning roles. Let your co-planners manage events as editors, add new users and edit trip details as admins or keep others as Viewers so they can follow along without changing the plan.",
    },
    {
      icon: <Search className="text-brand-primary" size={28} />,
      title: "Google Event Search",
      description:
        "Find restaurants, museums, and hidden gems using Google's database and add them to your trip in a single click.",
    },
    {
      icon: <Navigation className="text-brand-primary" size={28} />,
      title: "AI Travel Tips",
      description:
        "Get helpful, local advice tailored to your destination—from the best visiting hours to must-try local spots.",
    },
    {
      icon: <Download className="text-brand-primary" size={28} />,
      title: "Calendar Export",
      description:
        "Keep your plans in your pocket. Export your entire itinerary to your personal calendar so you're always on schedule, even offline.",
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
        <a href="mailto:akhereaihoeghinlan@gmail.com">
          akhereaihoeghinlan@gmail.com
        </a>{" "}
        if you have any questions, queries or requests.
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
