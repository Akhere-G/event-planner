import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import { APIProvider } from "@vis.gl/react-google-maps";
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
});

posthog?.register({
  environment: import.meta.env.VITE_APP_ENV,
});

window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

const mapsAPIKey = "AIzaSyAzLmSK-RsggriUFdkHmir3A3kzJp4iyGU";

if (!mapsAPIKey) {
  console.error("No maps api key present!");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter basename="/app">
        <Provider store={store}>
          <APIProvider apiKey={mapsAPIKey} libraries={["places"]}>
            <App />
          </APIProvider>
        </Provider>
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>,
);
