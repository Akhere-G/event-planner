"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "@posthog/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { APP_URL } from "./lib/urls";

interface CookieConsentContextValue {
  openPreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2026-05-30",
      cookieless_mode: "on_reject",
      opt_out_capturing_by_default: true,
      opt_out_persistence_by_default: true,
      opt_out_capturing_persistence_type: "cookie",
      consent_persistence_name: "triptrack_cookie_consent",
      person_profiles: "identified_only",
      loaded: () => setReady(true),
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      {ready ? (
        <CookieConsentProvider>{children}</CookieConsentProvider>
      ) : (
        <CookieConsentContext.Provider value={{ openPreferences: () => {} }}>
          {children}
        </CookieConsentContext.Provider>
      )}
    </PHProvider>
  );
}

function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consentStatus, setConsentStatus] = useState<
    "pending" | "granted" | "denied"
  >(() => posthog.get_explicit_consent_status());
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    consentStatus === "granted",
  );

  function acceptCookies() {
    posthog.opt_in_capturing({
      captureEventName: "cookie_consent_granted",
    });
    setAnalyticsEnabled(true);
    setConsentStatus("granted");
    setPreferencesOpen(false);
  }

  function savePreferences() {
    if (analyticsEnabled) {
      posthog.opt_in_capturing({
        captureEventName: "cookie_consent_granted",
      });
      setConsentStatus("granted");
    } else {
      posthog.opt_out_capturing();
      setConsentStatus("denied");
    }
    setPreferencesOpen(false);
  }

  function openPreferences() {
    setAnalyticsEnabled(consentStatus === "granted");
    setPreferencesOpen(true);
  }

  return (
    <CookieConsentContext.Provider value={{ openPreferences }}>
      {children}

      {consentStatus === "pending" && (
        <aside
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl md:flex md:items-center md:gap-6"
        >
          <div className="flex-1">
            <h2 className="text-lg font-bold">Your cookie choices</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              We use necessary cookies to run TripTrack. With your permission,
              we also use PostHog analytics cookies to understand how TripTrack
              is used. Until you accept analytics cookies, PostHog runs without
              cookies or browser storage. Read our{" "}
              <Link
                className="font-medium text-brand-primary underline"
                href={`${APP_URL}/privacy`}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-0">
            <button
              className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
              onClick={acceptCookies}
            >
              Accept cookies
            </button>
            <button
              className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
              onClick={openPreferences}
            >
              Choose options
            </button>
          </div>
        </aside>
      )}

      {preferencesOpen && (
        <CookiePreferencesModal
          analyticsEnabled={analyticsEnabled}
          onAnalyticsChange={setAnalyticsEnabled}
          onClose={() => setPreferencesOpen(false)}
          onSave={savePreferences}
        />
      )}
    </CookieConsentContext.Provider>
  );
}

interface CookiePreferencesModalProps {
  analyticsEnabled: boolean;
  onAnalyticsChange: (checked: boolean) => void;
  onClose: () => void;
  onSave: () => void;
}

function CookiePreferencesModal({
  analyticsEnabled,
  onAnalyticsChange,
  onClose,
  onSave,
}: CookiePreferencesModalProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="cookie-preferences-title" className="text-xl font-bold">
              Cookie preferences
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose whether TripTrack may store analytics cookies. Necessary
              cookies cannot be disabled because the service needs them to work.
            </p>
          </div>
          <button
            aria-label="Close cookie preferences"
            className="rounded-full px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <CookieOption
            title="Strictly necessary"
            description="Used for security and saving your cookie choice."
            checked
            disabled
          />
          <CookieOption
            title="Analytics"
            description="Allows PostHog to remember your device across visits and help us understand feature usage."
            checked={analyticsEnabled}
            onChange={onAnalyticsChange}
          />
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          When Analytics is off, PostHog uses cookieless measurement without
          cookies or local storage. You can change this choice at any time.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
            onClick={onSave}
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}

interface CookieOptionProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function CookieOption({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: CookieOptionProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${title} cookies`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-primary" : "bg-slate-200"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider",
    );
  }
  return context;
}
