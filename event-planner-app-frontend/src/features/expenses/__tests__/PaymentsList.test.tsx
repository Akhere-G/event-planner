import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setCredentials } from "../../auth/services/authSlice";
import type { Trip } from "../../trips/types";
import {
  createTestStore,
  renderWithProviders,
} from "../../../test-utils/renderWithProviders";
import PaymentsList from "../components/PaymentsList";
import type { Settlement } from "../types";

const trip = (role: string) => ({ id: 1, role }) as unknown as Trip;

const payment = (id: number, createdById: number): Settlement => ({
  id,
  itineraryId: 1,
  fromUserId: 5,
  toUserId: 6,
  amountGbp: 12.5,
  settledOn: "2026-08-02",
  fromUser: { id: 5, username: "sam" },
  toUser: { id: 6, username: "kit" },
  createdById,
});

function stubApi(payments: Settlement[]) {
  const fetchMock = vi
    .fn()
    .mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ success: true, data: payments, message: "" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderList(role: string, userId: number) {
  const store = createTestStore();
  store.dispatch(setCredentials({ id: userId }));
  return renderWithProviders(<PaymentsList trip={trip(role)} />, { store });
}

afterEach(() => vi.unstubAllGlobals());

describe("PaymentsList", () => {
  it("lists each payment with who paid whom, the amount and the date", async () => {
    stubApi([payment(1, 5)]);
    renderList("viewer", 9);

    expect(await screen.findByText(/sam\s+kit/)).toBeInTheDocument();
    expect(screen.getByText("£12.50")).toBeInTheDocument();
    expect(screen.getByText("2 Aug 2026")).toBeInTheDocument();
  });

  it("says so when no payment has been recorded", async () => {
    stubApi([]);
    renderList("editor", 5);

    expect(await screen.findByText("No payments recorded yet.")).toBeVisible();
  });

  it("offers delete only on payments the user may change", async () => {
    stubApi([payment(1, 5), payment(2, 6)]);
    renderList("editor", 5);

    await screen.findAllByText("£12.50");
    expect(
      screen.getAllByRole("button", { name: /delete payment/i }),
    ).toHaveLength(1);
  });

  it("lets an admin delete a payment someone else recorded", async () => {
    stubApi([payment(2, 6)]);
    renderList("admin", 1);

    expect(
      await screen.findByRole("button", { name: /delete payment/i }),
    ).toBeInTheDocument();
  });

  it("deletes a payment after confirming", async () => {
    const fetchMock = stubApi([payment(1, 5)]);
    const user = userEvent.setup();
    renderList("editor", 5);

    await user.click(
      await screen.findByRole("button", { name: /delete payment/i }),
    );
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls
        .map(([request]) => request as Request)
        .find((request) => request.method === "DELETE");
      expect(deleteCall?.url).toContain(
        "/itineraries/1/expenses/settlements/1",
      );
    });
  });
});
