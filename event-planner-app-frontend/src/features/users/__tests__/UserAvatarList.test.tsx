import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import authReducer from "../../auth/services/authSlice";
import { realtimeSlice, setPresence } from "../../realtime/realtimeSlice";
import UserAvatarList from "../components/UserAvatarList";
import type { User } from "../types";

const member = (id: number, username: string): User => ({
  id,
  username,
  email: `${username.toLowerCase()}@example.com`,
  role: "viewer",
});

function renderList(
  users: User[],
  presence: { userId: number | null; name: string }[],
) {
  const store = configureStore({
    reducer: { auth: authReducer, realtime: realtimeSlice.reducer },
  });
  store.dispatch(setPresence(presence.map((user) => ({ ...user, day: null }))));

  return render(
    <Provider store={store}>
      <UserAvatarList users={users} />
    </Provider>,
  );
}

describe("UserAvatarList", () => {
  const users = [member(1, "Ada"), member(2, "Bob")];

  it("marks only the members who are live on the trip", () => {
    renderList(users, [{ userId: 2, name: "Bob" }]);

    const dots = screen.getAllByRole("img", { name: "Online" });
    expect(dots).toHaveLength(1);
    expect(screen.getByText("B")).toContainElement(dots[0]);
  });

  it("shows no indicator when nobody is live", () => {
    renderList(users, []);

    expect(screen.queryByRole("img", { name: "Online" })).toBeNull();
  });
});
