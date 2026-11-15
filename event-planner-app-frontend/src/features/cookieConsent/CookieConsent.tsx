import {
  useState,
  type ReactNode,
} from "react";
import { usePostHog } from "@posthog/react";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { CookieConsentContext } from "./context";

export function CookieConsentProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const posthog = usePostHog();
  const [consentStatus, setConsentStatus] = useState<
    "pending" | "granted" | "denied"
  >(() => posthog.get_explicit_consent_status());
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    () => posthog.get_explicit_consent_status() === "granted",
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

  const contextValue = {
    analyticsEnabled: enabled && analyticsEnabled,
    openPreferences: enabled ? openPreferences : () => {},
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}

      {enabled && consentStatus === "pending" && (
        <aside
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-xl border border-surface-border bg-surface p-5 text-text-primary shadow-xl md:flex md:items-center md:gap-6"
        >
          <div className="flex-1">
            <h2 className="text-lg font-bold">Your cookie choices</h2>
            <p className="mt-2 text-sm text-text-secondary">
              We use necessary cookies to run TripTrack. With your permission,
              we also use PostHog analytics cookies to understand how TripTrack
              is used. Until you accept analytics cookies, PostHog runs without
              cookies or browser storage. Read our{" "}
              <Link className="text-brand-primary underline" to="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-0">
            <button className="btn-primary" onClick={acceptCookies}>
              Accept cookies
            </button>
            <button className="btn-secondary" onClick={openPreferences}>
              Choose options
            </button>
          </div>
        </aside>
      )}

      <Dialog
        open={enabled && preferencesOpen}
        onOpenChange={setPreferencesOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader className="-mx-4 -mt-4 rounded-t-xl bg-brand-primary p-4 text-text-inverse">
            <DialogTitle>Cookie preferences</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-text-secondary">
            Choose whether TripTrack may store analytics cookies. Necessary
            cookies cannot be disabled because the service needs them to work.
          </DialogDescription>

          <CookieOption
            title="Strictly necessary"
            description="Used for sign-in, security and saving your cookie choice."
            checked
            disabled
          />
          <CookieOption
            title="Analytics"
            description="Allows PostHog to remember your device across visits and help us understand feature usage."
            checked={analyticsEnabled}
            onChange={setAnalyticsEnabled}
          />

          <p className="text-sm text-text-secondary">
            When Analytics is off, PostHog uses cookieless measurement without
            cookies or local storage. You can change this choice at any time.
          </p>

          <DialogFooter>
            <button className="btn-primary" onClick={savePreferences}>
              Save preferences
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CookieConsentContext.Provider>
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-surface-border p-4">
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${title} cookies`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-primary" : "bg-surface-muted"
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

