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

posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
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
      <BrowserRouter>
        <Provider store={store}>
          <APIProvider apiKey={mapsAPIKey} libraries={["places"]}>
            <App />
          </APIProvider>
        </Provider>
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>,
);
