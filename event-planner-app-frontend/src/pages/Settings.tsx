import React from "react";
import { User, Shield, Moon, Save, Palette } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { THEMES } from "../features/theme/constants";
import { setTheme, toggleDarkMode } from "../features/theme/themeSlice";

export default function SettingsPage() {
  const { darkMode, theme } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  return (
    <div className="container">
      <div className="grid gap-6">
        <header className="card ">
          <h1 className="text-3xl font-bold text-text-main">Settings</h1>
          <p className="text-text-sub">Your preferences</p>
        </header>

        <SettingsCard
          icon={<Palette className="text-brand-primary" />}
          title="Theme Selection"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {THEMES.map((t) => (
              <button
                aria-label={`Change Theme to ${t.name}`}
                key={t.name}
                onClick={() => dispatch(setTheme(t.id))}
                className={`py-2 rounded-lg border text-sm transition-all cursor-pointer  ${
                  theme === t.id
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                    : "border-surface-border hover:border-brand-primary/50 font-medium dark:surface-border"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </SettingsCard>
        <SettingsCard
          icon={<Moon className="text-brand-primary" />}
          title="Appearance"
        >
          <div className="flex items-center justify-between">
            <span className="text-text-main font-medium">Dark Mode</span>
            <button
              aria-label="Toggle dark mode"
              onClick={() => dispatch(toggleDarkMode())}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                darkMode ? "bg-brand-primary" : "bg-surface-muted"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4 border-b border-surface-border pb-3">
        {icon}
        <h3 className="text-lg font-bold text-text-main">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function FutureSections() {
  {
    /* Profile Section */
  }
  <div>
    <SettingsCard
      icon={<User className="text-brand-primary" />}
      title="Profile"
    >
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 bg-surface-muted rounded-md border  text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-2 bg-surface-muted rounded-md border text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
        />
      </div>
    </SettingsCard>

    {/* Security Section */}
    <SettingsCard
      icon={<Shield className="text-brand-primary" />}
      title="Security"
    >
      <button aria-label="Change password" className="btn-secondary">
        Change Password
      </button>
    </SettingsCard>

    <div className="mt-8 flex justify-end">
      <button
        aria-label="Save changes"
        className="btn-primary flex items-center gap-2"
      >
        <Save size={18} /> Save Changes
      </button>
    </div>
  </div>;
}
