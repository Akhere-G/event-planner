import Link from "next/link";
import Image from "next/image";
import {
  Map,
  Calendar,
  Users,
  Search,
  Zap,
  Globe,
  Bell,
  Route,
  Lightbulb,
  Download,
  Backpack,
  KeyRound,
  Vote,
  Palette,
} from "lucide-react";
import { TrackedLink } from "./components/TrackedLink";

function Logo({
  light = false,
  size = 20,
}: {
  light?: boolean;
  size?: number;
}) {
  return (
    <span
      className="font-outfit font-bold tracking-tight"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span className={light ? "text-white" : "text-[#1C1410]"}>Trip</span>
      <span className="text-brand-primary">Track</span>
    </span>
  );
}
const url = process.env.NEXT_PUBLIC_BASE_URL || "https://triptrack.uk/app";
function HeroMockup() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 w-full">
      <Image
        src="/trippage_list.png"
        alt="TripTrack Homepage"
        width={900}
        height={540}
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

const features = [
  {
    icon: <Map size={24} />,
    title: "Map & Calendar View",
    description:
      "Schedule every event in a clear calendar while viewing the routes between them on Google Maps at the same time. See where each activity fits into your day, understand travel time between stops, and adjust your plans without jumping between apps or losing sight of the bigger picture.",
    image: "/trippage_calendar.png",
  },
  {
    icon: <Zap size={24} />,
    title: "Smart Planning",
    description:
      "Stuck for ideas? Our smart system instantly fills your day with intelligent suggestions based on your preferences, travel pace, and group. It also reorders events to fix timing clashes and group nearby spots together, so you spend less time travelling.",
    image: "/fill_in_day.png",
  },
  {
    icon: <Users size={24} />,
    title: "Team Collaboration",
    description:
      "Onboard your group in seconds. Simply share a secure link and start planning together—no more back-and-forth in the group chat. Stay in control by assigning roles: let co-planners manage events as Editors, join as Admins, or follow along as Viewers.",
    image: "/trippage_user_management.png",
  },
  {
    icon: <Search size={24} />,
    title: "Google Event Search",
    description:
      "Find restaurants, museums, attractions, and hidden gems using Google’s extensive database. Review useful place details, discover what is nearby, and add the right spots to your trip in a single click.",
    image: "/map.png",
  },
];

const featureCards = [
  {
    icon: <Bell size={20} />,
    title: "Event Alerts",
    description:
      "Get timely reminders before events so you never miss an important moment.",
  },
  {
    icon: <Route size={20} />,
    title: "Route Planning",
    description:
      "Optimise routes between events so your group spends less time travelling.",
  },
  {
    icon: <Download size={20} />,
    title: "Export Options",
    description:
      "Export your itinerary to calendars or documents for simple sharing.",
  },
  {
    icon: <Backpack size={20} />,
    title: "Smart Packing Lists",
    description:
      "Generate a practical packing list based on your destination, activities, and plans.",
  },
  {
    icon: <KeyRound size={20} />,
    title: "Quick Member Invites",
    description:
      "Add trip members quickly with a secure invite token and start planning together.",
  },
  {
    icon: <Lightbulb size={20} />,
    title: "Travel Insights",
    description:
      "Explore useful travel tips and practical recommendations on your insights page.",
  },
  {
    icon: <Vote size={20} />,
    title: "Wishlist Voting",
    description:
      "Suggest activities to a shared wishlist and let members vote on what to include.",
  },
  {
    icon: <Palette size={20} />,
    title: "Colourful Location Themes",
    description:
      "Personalise each trip with colourful, location-based themes for a distinctive feel.",
  },
];
const scrolled = true;
const menuOpen = false;

function Navbar() {
  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-slate-200"
            : "bg-transparent"
        } px-4 md:px-8`}
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center gap-10">
          <Logo light={!scrolled} />
          <div className="hidden md:flex gap-8 flex-1">
            {[].map((l) => (
              <Link
                key={l}
                href="#"
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>
          <div className="flex gap-3 items-center ml-auto">
            <TrackedLink
              href={`${url}/login`}
              event="signup_page_visited"
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-slate-900 hover:text-slate-700"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Sign in
            </TrackedLink>

            <TrackedLink
              href={`${url}/register`}
              event="register_page_visited"
              className="bg-brand-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
            >
              Get Started
            </TrackedLink>
          </div>
          <button
            className={`hidden ml-auto bg-none border-none cursor-pointer ${
              scrolled ? "text-slate-900" : "text-white"
            } text-2xl`}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen font-outfit">
      <Navbar />
      <section className="bg-[#0F1419] min-h-screen flex flex-col justify-center pt-24 pb-20 px-3 md:px-5 relative overflow-hidden">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-brand-primary/20 pointer-events-none blur-3xl" />
        <div className="absolute bottom-[5%] left-[2%] w-[300px] h-[300px] rounded-full bg-[#6B9FB8]/30 pointer-events-none blur-3xl" />
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.12]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 Q200,100 400,300 Q600,500 800,200 Q1000,-100 1200,300"
            stroke="#E07A2A"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,6"
          />
          <path
            d="M100,500 Q300,200 500,400 Q700,600 900,300"
            stroke="#6B9FB8"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="5,8"
          />
        </svg>

        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-10 items-center">
          <div className="animate-fadeUp order-1 -ml-3 md:ml-0">
            <h1 className="font-fraunces text-[clamp(44px,6vw,80px)] font-bold text-white leading-[1.05] mb-6 tracking-tight">
              Travel planning,
              <br />
              <span className="text-brand-primary italic">simplified.</span>
            </h1>
            <p className="text-[clamp(15px,1.8vw,18px)] text-white/70 leading-[1.7] max-w-lg mb-10">
              We built TripTrack to get rid of messy spreadsheets and endless
              tabs. One place to plan your route, chat with friends, and let
              smart features handle the boring bits.
            </p>
            <div className="flex gap-4 flex-wrap">
              <TrackedLink
                href={`${url}/register`}
                event="register_page_visited"
                className="bg-brand-primary text-white text-base font-bold px-8 py-3.5 rounded-full hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
              >
                Start planning
              </TrackedLink>
              <Link
                href="#features"
                className="bg-transparent text-white/85 text-base font-medium px-8 py-3.5 rounded-full border-2 border-white/25 hover:bg-white/10 transition-colors"
              >
                Explore TripTrack
              </Link>
            </div>
          </div>

          <div className="flex justify-center animate-fadeUp order-2">
            <div className="animate-float w-full lg:scale-105 md:origin-center md:-ml-3 lg:mr-3">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200 py-6 px-3 md:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-0 flex-wrap justify-center">
            {[
              { icon: <Calendar size={16} />, label: "Plan itineraries" },
              { icon: <Users size={16} />, label: "Collaborate with friends" },
              { icon: <Lightbulb size={16} />, label: "Smart planning" },
              { icon: <Map size={16} />, label: "Maps & routes" },
              { icon: <Download size={16} />, label: "Calendar sync" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-0">
                {i > 0 && <div className="w-px h-5 bg-slate-200 mx-6" />}
                <div className="flex items-center gap-2">
                  <span className="text-brand-primary">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-900 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#FAFAF7] py-20 px-3 md:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-fraunces text-[clamp(32px,5vw,56px)] font-bold text-[#1C1410] mb-4 tracking-tight">
              Why use TripTrack?
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Everything you need to turn a destination into a trip.
            </p>
          </div>
          <div className="flex flex-col gap-10">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid md:grid-cols-1 ${
                  index % 2 === 0
                    ? "lg:grid-cols-[0.3fr_0.7fr]"
                    : "lg:grid-cols-[0.7fr_0.3fr]"
                } gap-0 items-stretch bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[400px]`}
              >
                <div
                  className={`p-8 md:p-10 flex flex-col justify-center min-h-[400px] order-2 ${
                    index % 2 === 0 ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-[#1C1410]">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-base text-slate-500 leading-[1.7]">
                    {feature.description}
                  </p>
                </div>
                <div
                  className={`bg-slate-50 relative h-[400px] ${
                    index % 2 === 0
                      ? "order-1 lg:order-2"
                      : "order-1 lg:order-1"
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    {card.icon}
                  </div>
                  <h4 className="text-lg font-bold text-[#1C1410]">
                    {card.title}
                  </h4>
                </div>
                <p className="text-sm text-slate-500 leading-[1.6]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0F1419] py-20 px-3 md:px-5 relative overflow-hidden text-center">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={`${(i * 100) / 12}%`}
              x2="100%"
              y2={`${(i * 100) / 12}%`}
              stroke="white"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={`${(i * 100) / 16}%`}
              y1="0"
              x2={`${(i * 100) / 16}%`}
              y2="100%"
              stroke="white"
              strokeWidth="1"
            />
          ))}
          <path
            d="M10%,80% Q30%,20% 50%,50% Q70%,80% 90%,30%"
            stroke="#E07A2A"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,5"
          />
          {[
            ["15%", "75%"],
            ["48%", "52%"],
            ["85%", "35%"],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="#E07A2A" />
              <circle cx={x} cy={y} r="4" fill="white" />
            </g>
          ))}
        </svg>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-4 py-2 mb-8">
            <Globe size={14} />
            <span className="text-xs font-medium text-brand-primary">
              Ready when you are
            </span>
          </div>
          <h2 className="font-fraunces text-[clamp(32px,5vw,64px)] font-bold text-white mb-6 leading-[1.05] tracking-tight">
            Ready to plan your
            <br />
            <span className="text-brand-primary italic">next adventure?</span>
          </h2>
          <p className="text-lg text-white/65 mb-10 leading-[1.7]">
            Stop juggling spreadsheets, tabs and group chats. Put your whole
            trip in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <TrackedLink
              href={`${url}/register`}
              event="register_page_visited"
              className="bg-brand-primary text-white text-base font-bold px-9 py-3.5 rounded-full hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
            >
              Start planning
            </TrackedLink>
            <Link
              href="#features"
              className="bg-transparent text-white/85 text-base font-medium px-9 py-3.5 rounded-full border-2 border-white/25 hover:bg-white/10 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 px-3 md:px-5 text-center border-t border-slate-200">
        <div className="max-w-md mx-auto">
          <h2 className="font-fraunces text-2xl font-bold text-[#1C1410] mb-4">
            Have a question?
          </h2>
          <p className="text-base text-slate-500 leading-[1.7]">
            Contact us at{" "}
            <a
              href="mailto:akhereaihoeghinlan@gmail.com"
              className="text-brand-primary font-semibold border-b-2 border-brand-primary hover:border-brand-primary/70 transition-colors"
            >
              akhereaihoeghinlan@gmail.com
            </a>{" "}
            if you have any questions, queries or requests.
          </p>
        </div>
      </section>

      <footer className="bg-[#0F1419] py-16 px-3 md:px-5 text-white/70">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <Logo light size={22} />
              <p className="text-sm text-white/50 mt-4 leading-[1.7]">
                Plan your trips and collaborate with friends
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6 items-center flex-wrap">
              <span className="text-xs text-white/40 font-mono">v2.0.26</span>
              <span className="text-xs text-white/40">
                © 2026 TripTrack. Built for travellers.
              </span>
              <TrackedLink
                href={`${url}/privacy`}
                event="privacy_page_visited"
                className="text-xs text-white/45 hover:text-white/70 transition-colors"
              >
                Privacy
              </TrackedLink>
              <TrackedLink
                href={`${url}/terms`}
                event="terms_page_visited"
                className="text-xs text-white/45 hover:text-white/70 transition-colors"
              >
                Terms
              </TrackedLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
