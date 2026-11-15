import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { CookieConsentProvider } from "./features/cookieConsent";

const PROJECT_TOKEN = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const PROJECT_HOST = import.meta.env.VITE_POSTHOG_HOST;
const POSTHOG_ENABLED = Boolean(PROJECT_HOST && PROJECT_TOKEN);

if (POSTHOG_ENABLED) {
  posthog.init(PROJECT_TOKEN, {
    api_host: PROJECT_HOST,
    defaults: "2026-05-30",
    cookieless_mode: "on_reject",
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    opt_out_capturing_persistence_type: "cookie",
    consent_persistence_name: "triptrack_cookie_consent",
    person_profiles: "identified_only",
  });

  posthog.register({
    environment: import.meta.env.VITE_APP_ENV,
  });
} else {
  console.warn("PostHog host or project token is missing. Analytics disabled.");
}

window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter>
        <CookieConsentProvider enabled={POSTHOG_ENABLED}>
          <Provider store={store}>
            <App />
          </Provider>
        </CookieConsentProvider>
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>,
);
