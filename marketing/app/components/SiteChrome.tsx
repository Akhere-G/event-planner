import Link from "next/link";
import { Logo } from "./Logo";
import { TrackedLink } from "./TrackedLink";
import { APP_URL } from "../lib/urls";

const LINKS = [
  { label: "Destinations", href: "/destinations" },
  { label: "Travel guides", href: "/destinations" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-16 flex items-center gap-8">
        <Link href="/" aria-label="TripTrack home">
          <Logo />
        </Link>
        <nav className="hidden md:flex gap-8 flex-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <TrackedLink
            href={`${APP_URL}/templates`}
            event="templates_page_visited"
            className="bg-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-primary/90 transition-colors"
          >
            Browse templates
          </TrackedLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0F1419] py-12 px-4 md:px-8 text-white/70">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <Logo light size={22} />
        <div className="flex gap-6 flex-wrap text-xs text-white/45">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white/70 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <TrackedLink
            href={`${APP_URL}/privacy`}
            event="privacy_page_visited"
            className="hover:text-white/70 transition-colors"
          >
            Privacy
          </TrackedLink>
          <TrackedLink
            href={`${APP_URL}/terms`}
            event="terms_page_visited"
            className="hover:text-white/70 transition-colors"
          >
            Terms
          </TrackedLink>
        </div>
        <span className="text-xs text-white/40 w-full md:w-auto">
          © 2026 TripTrack. Built for travellers.
        </span>
      </div>
    </footer>
  );
}
