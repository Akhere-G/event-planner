import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { apiSlice } from "../../api/apiSlice";
import authReducer, { setCredentials } from "../../auth/services/authSlice";
import { mockFetchOnce } from "../../../test-utils/mockFetch";
import Templates from "../../../pages/Templates";
import TemplateDetail from "../../../pages/TemplateDetail";
import type { TemplateDetail as TemplateDetailData } from "../types";

vi.mock("../components/TemplateMap", () => ({
  default: () => <div data-testid="template-map" />,
}));
vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const summary = {
  slug: "paris-abc",
  title: "Paris in 3 days",
  destination: "Paris",
  latitude: 48.8,
  longitude: 2.3,
  durationDays: 3,
  description: "Classic Paris.",
  authorName: "sam",
  cloneCount: 4,
  createdAt: "2026-01-01T00:00:00",
  eventCount: 1,
  placeCount: 0,
};

const detail: TemplateDetailData = {
  ...summary,
  timezone: "Europe/Paris",
  days: [
    {
      dayOffset: 0,
      events: [
        {
          name: "Louvre",
          description: null,
          address: "Rue de Rivoli",
          latitude: 48.86,
          longitude: 2.33,
          category: "Culture",
          dayOffset: 0,
          startTime: "10:00",
          endDayOffset: 0,
          endTime: "12:30",
        },
      ],
    },
    { dayOffset: 1, events: [] },
    { dayOffset: 2, events: [] },
  ],
  accommodations: [],
  packingItems: [{ name: "Passport", category: "Docs" }],
  wishlistItems: [],
};

function makeStore(loggedIn: boolean) {
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer, auth: authReducer },
    middleware: (gdm) => gdm().concat(apiSlice.middleware),
  });
  if (loggedIn) store.dispatch(setCredentials({ id: 1 }));
  return store;
}

function LocationProbe() {
  const location = useLocation();
  return (
    <p data-testid="location">
      {location.pathname}|{JSON.stringify(location.state)}
    </p>
  );
}

function renderDetail(loggedIn: boolean) {
  return render(
    <Provider store={makeStore(loggedIn)}>
      <MemoryRouter initialEntries={["/templates/paris-abc"]}>
        <Routes>
          <Route path="/templates/:slug" element={<TemplateDetail />} />
          <Route path="/login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

function renderList() {
  return render(
    <Provider store={makeStore(false)}>
      <MemoryRouter>
        <Templates />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Templates page", () => {
  it("lists public templates without a login", async () => {
    mockFetchOnce({
      success: true,
      data: { templates: [summary], total: 1, hasMore: false },
    });
    renderList();

    expect(await screen.findByText("Paris in 3 days")).toBeInTheDocument();
    expect(screen.getByText("Used 4 times")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    mockFetchOnce({
      success: true,
      data: { templates: [], total: 0, hasMore: false },
    });
    renderList();

    expect(
      await screen.findByText("No templates have been published yet."),
    ).toBeInTheDocument();
  });
});

describe("TemplateDetail page", () => {
  it("shows the day-by-day plan and map", async () => {
    mockFetchOnce({ success: true, data: detail });
    renderDetail(false);

    expect(await screen.findByText("Louvre")).toBeInTheDocument();
    expect(screen.getByText("10:00–12:30 · Rue de Rivoli")).toBeInTheDocument();
    expect(screen.getByText("Day 3")).toBeInTheDocument();
    expect(screen.getByText("Passport")).toBeInTheDocument();
    expect(screen.getByTestId("template-map")).toBeInTheDocument();
  });

  it("sends logged-out users to login and back", async () => {
    const user = userEvent.setup();
    mockFetchOnce({ success: true, data: detail });
    renderDetail(false);

    await user.click(
      await screen.findByRole("button", { name: "Use this template" }),
    );

    expect((await screen.findByTestId("location")).textContent).toBe(
      '/login|{"from":"/templates/paris-abc"}',
    );
  });

  it("opens the start date modal for logged-in users", async () => {
    const user = userEvent.setup();
    mockFetchOnce({ success: true, data: detail });
    renderDetail(true);

    await user.click(
      await screen.findByRole("button", { name: "Use this template" }),
    );

    expect(await screen.findByLabelText("Start date")).toBeInTheDocument();
  });

  it("shows an error for an unknown template", async () => {
    mockFetchOnce({ success: false, message: "Template not found." }, 404);
    renderDetail(false);

    expect(
      await screen.findByText("This template could not be found."),
    ).toBeInTheDocument();
  });
});
