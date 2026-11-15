"use client";

import { useCookieConsent } from "../providers";

export function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      className="hover:text-white/70 transition-colors"
      onClick={openPreferences}
    >
      Cookie settings
    </button>
  );
}
