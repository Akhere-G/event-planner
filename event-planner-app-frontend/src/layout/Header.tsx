import { Menu, Moon, Sun, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useLogoutUserMutation } from "../features/auth/services/authApiSlice";
import { logOut } from "../features/auth/services/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../features/theme/themeSlice";
import type { RootState } from "../store";

interface HeaderProps {
  links: { title: string; url: string }[];
}
export default function Header({ links }: HeaderProps) {
  const { darkMode } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
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
          <span className="text-brand-secondary">Track</span>
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
              className={`flex flex-col w-40 card p-0 z-10 absolute right-2 top-full ${isMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}
            >
              <Link
                to="/settings"
                className="pt-3 pb-2 hover:bg-surface-muted text-center"
              >
                Settings
              </Link>
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

              <button
                onClick={() => dispatch(toggleDarkMode())}
                className="p-2 pb-3 flex hover:bg-surface-muted rounded-lg transition-colors"
                aria-label="Toggle Dark Mode"
              >
                <span className="w-29">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
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
        md:hidden flex flex-col items-start text-left  gap-4 text-end
        top-0
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center w-full">
          <p>Menu</p>
          <button
            className="btn-secondary md:hidden p-2 "
            aria-expanded={isSidebarOpen}
            aria-label="Close Menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
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
          <div className="mt-1">
            <Link
              to="/settings"
              className=" hover:bg-surface-muted text-center"
            >
              Settings
            </Link>
          </div>
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="flex text-sm items-center gap-2 mt-2 p-0 w-full justify-end"
          >
            <span className="w-19">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isAuthenticated && (
            <button
              onClick={async () => {
                await logout();
                dispatch(logOut());
                window.location.reload();
              }}
              className="btn-menu p-0 pt-2 text-sm"
            >
              Logout
            </button>
          )}
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
