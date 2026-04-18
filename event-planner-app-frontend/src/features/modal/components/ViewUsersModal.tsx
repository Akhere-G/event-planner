import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router";
import { closeModal } from "../modalSlice";

export default function ViewUsersModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener(
      "popstate",
      function () {
        console.log("pop!!");
        setSearchParams({});

        dispatch(closeModal());
      },
      false,
    );
  }, [dispatch, setSearchParams]);

  useEffect(() => {
    if (!searchParams.has("view")) {
      setSearchParams({ view: "users" });
    }
  }, [searchParams, setSearchParams]);

  const isUsersView = searchParams.get("view") === "users";
  const isInvitesView = searchParams.get("view") === "invites";

  const showUsers = () => setSearchParams({ view: "users" });
  const showInvites = () => setSearchParams({ view: "invites" });

  return (
    <div className="card">
      <header className="flex">
        <button
          className={`p-1 w-16 rounded-none ${isUsersView ? "text-brand-primary" : ""}`}
          onClick={showUsers}
        >
          <h2>Users</h2>
          <div
            className={`border-b-2 duration-300 border-brand-primary ${isUsersView ? "" : "translate-x-16"}`}
          />
        </button>
        <button
          className={`p-1 w-16 rounded-none ${isInvitesView ? "text-brand-primary" : ""}`}
          onClick={showInvites}
        >
          <h2>Invites</h2>
        </button>
      </header>
      {isUsersView && <UsersView />}
      {isInvitesView && <InvitesView />}
    </div>
  );
}

function UsersView() {
  return <div>Users</div>;
}
function InvitesView() {
  return <div>Invites</div>;
}
