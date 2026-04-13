import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface HeaderProps {
  links: { title: string; url: string }[];
}
export default function Header({ links }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="relative w-full">
      <div className=" bg-surface w-full flex justify-between items-center p-4 shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tighter">
          Trip
          <span className="text-brand-primary">Out</span>
        </h1>
        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="gap-6 flex">
            {links.map(({ title, url }) => (
              <li key={url}>
                <Link to={url}>{title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="btn-secondary md:hidden p-2"
          aria-expanded={isSidebarOpen}
          aria-label="Open Menu"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed z-30 h-full right-0 bg-surface p-4 shadow-md transition-transform
        md:hidden flex flex-col items-end gap-4 text-end
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="btn-secondary md:hidden p-2"
          aria-expanded={isSidebarOpen}
          aria-label="Close Menu"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} />
        </button>
        <nav>
          <ul className="flex flex-col gap-2">
            {links.map(({ title, url }) => (
              <li key={url}>
                <Link to={url} onClick={() => setIsSidebarOpen(false)}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Overlay/Backdrop */}
      <div
        className={`fixed inset-0 z-10 bg-black/40 backdrop-blur-sm md:hidden transition-all 
          ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </header>
  );
}
