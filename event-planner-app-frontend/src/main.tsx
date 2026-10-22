import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";

const PROJECT_TOKEN = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const PROJECT_HOST = import.meta.env.VITE_POSTHOG_HOST;

if (!PROJECT_HOST || !PROJECT_TOKEN) {
  console.error("Missing project host and error. Analytics disabled");
} else {
  console.log("keys loaded");
}

posthog.init(PROJECT_TOKEN, {
  api_host: PROJECT_HOST,
  defaults: "2026-05-30",
  persistence: "memory",
  person_profiles: "identified_only",
});

posthog?.register({
  environment: import.meta.env.VITE_APP_ENV,
});

window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>,
);
