import { Menu, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useLogoutUserMutation } from "../features/auth/services/authApiSlice";
import { logOut } from "../features/auth/services/authSlice";
import { useDispatch } from "react-redux";

interface HeaderProps {
  links: { title: string; url: string }[];
}
export default function Header({ links }: HeaderProps) {
  const [logout] = useLogoutUserMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dispatch = useDispatch();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="relative w-full">
      <div className=" bg-surface w-full flex justify-between items-center p-4 shadow-md">
        <h1 className="text-2xl font-extrabold tracking-tighter">
          Trip
          <span className="text-brand-primary">Out</span>
        </h1>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 relative">
          <nav>
            <ul className="gap-6 flex">
              {links.map(({ title, url }) => (
                <li key={url}>
                  <Link to={url}>{title}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 bg-brand-primary rounded-full h-10 w-10 "
            >
              <User size={20} />
            </button>
            <div
              className={`card p-0 absolute right-2 -bottom-13 ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}
            >
              <button
                onClick={async () => {
                  await logout();
                  dispatch(logOut());
                  window.location.reload();
                }}
                className="btn-menu"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

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
        top-0
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
