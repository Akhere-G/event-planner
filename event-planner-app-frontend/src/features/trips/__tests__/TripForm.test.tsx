import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test-utils/renderWithProviders";
import TripForm from "../components/TripForm";

vi.mock("../../../components/LocationInput", () => ({
  default: ({
    onPlaceSelect,
    label,
    errorMessage,
  }: {
    onPlaceSelect: (place: unknown) => void;
    label: string;
    errorMessage?: string;
  }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onPlaceSelect({
            name: "Paris",
            formatted_address: "Paris, France",
            geometry: { location: { lat: () => 48.8, lng: () => 2.3 } },
          })
        }
      >
        Pick {label}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
    </>
  ),
}));

function setup() {
  const submitAction = vi.fn().mockResolvedValue(undefined);
  renderWithProviders(
    <TripForm
      submitAction={submitAction}
      submitBtnText="Create"
      isLoading={false}
    />,
  );
  return { submitAction, user: userEvent.setup() };
}

async function reachReview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Pick Destination" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("button", { name: "Friends" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("button", { name: "Foodie" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("button", { name: "Mid-range" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
}

describe("TripForm stepper", () => {
  it("does not leave step one until the trip basics are valid", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(
      await screen.findByText("Destination is required."),
    ).toBeInTheDocument();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent(
      "Where & when",
    );
  });

  it("requires a trip type on the who step, then moves on and back", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Pick Destination" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Who is going?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Choose who is going.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Couple" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      await screen.findByText(/What vibe are you after/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText("Who is going?")).toBeInTheDocument();
  });

  it("creates the trip and preferences from the review step", async () => {
    const { user, submitAction } = setup();
    await reachReview(user);

    expect(screen.getByText("Paris, France")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    const [trip, preferences, options] = submitAction.mock.calls[0];
    expect(trip).toMatchObject({
      destination: "Paris, France",
      latitude: 48.8,
    });
    expect(preferences).toMatchObject({
      tripType: "friends",
      vibes: ["foodie"],
      budgetTier: "mid",
    });
    expect(options).toEqual({ generateWithAi: false });
  });

  it("asks for AI generation from the second review button", async () => {
    const { user, submitAction } = setup();
    await reachReview(user);

    await user.click(
      screen.getByRole("button", { name: "Create & generate with AI" }),
    );

    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(submitAction.mock.calls[0][2]).toEqual({ generateWithAi: true });
  });
});

describe("TripForm single page", () => {
  it("shows the core fields and a Preferences section together", () => {
    renderWithProviders(
      <TripForm
        variant="single"
        submitAction={vi.fn()}
        submitBtnText="Save changes"
        isLoading={false}
        initialData={{ name: "Rome", destination: "Rome, Italy" }}
      />,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Rome");
    expect(
      screen.getByRole("heading", { name: "Preferences" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });
});
