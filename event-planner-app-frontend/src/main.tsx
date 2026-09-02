import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import { APIProvider } from "@vis.gl/react-google-maps";

window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

const mapsAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!mapsAPIKey) {
  console.error("No maps api key present!");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <APIProvider apiKey={mapsAPIKey} libraries={["places"]}>
          <App />
        </APIProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
