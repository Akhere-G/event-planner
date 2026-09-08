import {
  Mail,
  ShieldCheck,
  SquareArrowRightExitIcon,
  Trash,
  User as UserIcon,
} from "lucide-react";
import { UserRole, type User } from "../types";
import { useEffect, useState } from "react";

import { useMatch } from "react-router";
import { isFetchBaseQueryError } from "../../api/utils";
import { useRemoveUserMutation, useUpdateUserMutation } from "../usersApiSlice";
import { ConfirmModal, EditableSelect } from "../../../components";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { usePostHog } from "@posthog/react";

export default function UserRow({ user }: { user: User }) {
  const { userId } = useSelector((state: RootState) => state.auth);
  const [userRole, setUserRole] = useState(user.role);
  const [removeUser, { isLoading: removeIsLoading }] = useRemoveUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);
  const { username, email, id } = user;

  const isCurrentUser = id === userId;
  const formattedUsername = username + (isCurrentUser ? " (You)" : "");
  const posthog = usePostHog();

  useEffect(() => {
    setUserRole(user.role);
  }, [user]);

  async function remove() {
    try {
      await removeUser({ tripId, userId: user.id }).unwrap();
      posthog?.capture(
        isCurrentUser ? "user_left_trip" : "user_removed_from_trip",
        { trip_id: tripId },
      );

      setIsConfirmOpen(false);
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  async function updateRole(role: string) {
    const oldRole = userRole;
    try {
      setUserRole(role);
      await updateUser({
        tripId,
        userId: user.id,
        newUserData: { role },
      }).unwrap();
    } catch (err) {
      setUserRole(oldRole);
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  const RemoveUserIcon = isCurrentUser ? SquareArrowRightExitIcon : Trash;
  const removeTitle = isCurrentUser ? "Leave trip" : `Remove ${username}`;

  return (
    <tr className="group hover:bg-surface-muted/30 transition-colors text-sm md:text-current">
      <td className="px-2 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 hidden md:block rounded-full bg-brand-primary/10 text-brand-primary">
            <UserIcon size={16} />
          </div>
          <span>{formattedUsername}</span>
        </div>
      </td>
      <td className="px-2 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 hidden md:block rounded-full bg-brand-primary/10 text-brand-primary">
            <Mail size={16} />
          </div>
          <span>{email}</span>
        </div>
      </td>
      <td className="px-2 md:px-6 py-4">
        <div className="flex items-center justify-center gap-1.5 text-sm text-text-secondary capitalize">
          <ShieldCheck className="hidden md:flex" size={14} />
          <EditableSelect
            canEdit
            defaultElement={<p>{userRole}</p>}
            selectedValue={userRole}
            options={Object.values(UserRole).map((value) => ({
              title: value[0].toUpperCase() + value.substring(1),
              value,
            }))}
            setValue={updateRole}
          />
        </div>
      </td>

      <td className="pr-4  py-4 text-right ">
        <button
          onClick={() => setIsConfirmOpen(true)}
          title={removeTitle}
          className="p-1 hover:bg-surface-muted rounded-full transition-colors"
        >
          <RemoveUserIcon size={18} className="text-text-secondary" />
        </button>

        {isConfirmOpen && (
          <ConfirmModal
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            confirmAction={remove}
            title={isCurrentUser ? "Leave trip?" : `Remove ${username}?`}
            confirmText={isCurrentUser ? "Leave trip" : `Remove ${username}`}
            confirmButtonProps={{ disabled: removeIsLoading }}
          />
        )}
      </td>
    </tr>
  );
}
