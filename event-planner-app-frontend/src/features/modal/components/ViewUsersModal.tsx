import { useState } from "react";
import { UsersView } from "../../users/components";
import InvitesView from "../../invites/components/InviteView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface ViewUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewType = "users" | "invites";

export default function ViewUsersModal({ open, onOpenChange }: ViewUsersModalProps) {
  const [view, setView] = useState<ViewType>("users");

  const isUsersView = view === "users";
  const isInvitesView = view === "invites";

  const showUsers = () => setView("users");
  const showInvites = () => setView("invites");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
