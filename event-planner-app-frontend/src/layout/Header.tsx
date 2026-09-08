import { Menu, Moon, Sun, User, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useLogoutUserMutation } from "../features/auth/services/authApiSlice";
import { logOut } from "../features/auth/services/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../features/theme/themeSlice";
import type { RootState } from "../store";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import NotificationBell from "../features/notifications/components/NotificationBell";
import { useBreakpoint } from "../hooks/useBreakpoint";

interface HeaderProps {
  links: { title: string; url: string }[];
}
export default function Header({ links }: HeaderProps) {
  const { darkMode } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogoutUserMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dispatch = useDispatch();

  const location = useLocation();

  const from = location.state?.from || location;
  const breakpoint = useBreakpoint();
  const isMobile = ["xs", "sm"].includes(breakpoint);
  return (
    <header className="relative w-full z-2 ">
      <div className="z-2 bg-surface min-h-12 max-h-24 h-[6.5vh] w-full flex justify-between items-center p-4 shadow-md">
        <h1 className="text-2xl font-extrabold tracking-tighter">
          Trip
          <span className="text-brand-secondary tracking-tight">Track</span>
        </h1>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 relative">
          <nav>
            <ul className="gap-6 flex">
              {links.map(({ title, url }) => (
                <li key={url}>
                  <Link to={url} state={{ from }}>
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2.5 bg-brand-primary rounded-full h-10 w-10 hover:bg-brand-primary/90 transition-colors">
              <User className="text-text-inverse" size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated && (
                <>
                  <DropdownMenuItem>
                    <Link to="/settings" className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => dispatch(toggleDarkMode())}
                className="flex justify-between items-center"
              >
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                  dispatch(logOut());
                  window.location.reload();
                }}
                className="text-error"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Toggle */}
        {isMobile && (
          <div className="flex gap-2 items-center">
            {isAuthenticated && <NotificationBell />}

            <button
              className="btn-secondary md:hidden p-2"
              aria-expanded={isSidebarOpen}
              aria-label="Open Menu"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed z-50 h-full right-0 bg-surface shadow-md transition-transform
        md:hidden flex flex-col items-start gap-4 text-start
        top-0
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex pl-2 pt-2 justify-between items-center w-full">
          <p>Menu</p>
          <button
            className="btn-secondary md:hidden p-2 mr-2"
            aria-expanded={isSidebarOpen}
            aria-label="Close Menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
        <nav>
          <ul className="px-1">
            {links.map(({ title, url }) => (
              <li key={url}>
                <Link
                  className="block py-2 pl-2 text-left hover:bg-surface-muted rounded-md"
                  to={url}
                  state={{ from }}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-1 px-1">
            {isAuthenticated && (
              <Link
                to="/settings"
                className="block py-2 pl-2 text-left hover:bg-surface-muted rounded-md"
                onClick={() => setIsSidebarOpen(false)}
              >
                Settings
              </Link>
            )}
          </div>
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="py-2 pl-2 text-left hover:bg-surface-muted rounded-md flex items-center gap-2 mx-1 hover:brightness-95"
          >
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated && (
            <button
              onClick={async () => {
                await logout();
                dispatch(logOut());
                window.location.reload();
              }}
              className="block py-2 pl-2 text-left hover:bg-surface-muted rounded-md w-full mx-1 hover:brightness-95"
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
