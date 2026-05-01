import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router";
import { closeModal } from "../modalSlice";
import { UsersView } from "../../users/components";
import InvitesView from "../../invites/components/InviteView";
import { X } from "lucide-react";

export default function ViewUsersModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener(
      "popstate",
      function () {
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
    <div className="card border-0">
      <div className="flex items-center justify-between mb-4">
        <header className="flex ">
          <button
            className={`p-1 w-20 rounded-none ${isUsersView ? "text-brand-primary" : ""}`}
            onClick={showUsers}
          >
            <h2 className="title">Users</h2>
            <div
              className={`pointer-events-none border-b-2 duration-300 border-brand-primary ${isUsersView ? "" : "translate-x-19"}`}
            />
          </button>
          <button
            className={`p-1 w-16 rounded-none ${isInvitesView ? "text-brand-primary" : ""}`}
            onClick={showInvites}
          >
            <h2 className="title">Invites</h2>
          </button>
        </header>
        <button
          onClick={() => dispatch(closeModal())}
          className="p-1 btn-secondary"
          aria-label="Close"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      {isUsersView && <UsersView />}
      {isInvitesView && <InvitesView />}
    </div>
  );
}
