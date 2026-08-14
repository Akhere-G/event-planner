import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router";
import { closeModal } from "../modalSlice";
import { UsersView } from "../../users/components";
import InvitesView from "../../invites/components/InviteView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

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
    <Dialog open={true} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex">
              <button
                className={`p-1 w-20 rounded-none ${isUsersView ? "font-bold italic " : ""}`}
                onClick={showUsers}
              >
                <DialogTitle className="title">Users</DialogTitle>
                <div
                  className={`pointer-events-none border-b-2 duration-300 translate-y-2 ${isUsersView ? "" : "translate-x-19"}`}
                />
              </button>
              <button
                className={`p-1 w-16 rounded-none ${isInvitesView ? "font-bold italic " : ""}`}
                onClick={showInvites}
              >
                <DialogTitle className="title">Invites</DialogTitle>
              </button>
            </div>
          </div>
        </DialogHeader>

        {isUsersView && <UsersView />}
        {isInvitesView && <InvitesView />}
      </DialogContent>
    </Dialog>
  );
}
