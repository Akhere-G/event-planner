import { Ban, Mail, MoreVertical, RotateCcw } from "lucide-react";
import type { Invite } from "../types";
import {
  useCreateInviteMutation,
  useRevokeInviteMutation,
} from "../services/inviteApiSlice";
import { useMatch } from "react-router";
import { isFetchBaseQueryError } from "../../api/utils";
import { getStatusConfig } from "../utils";
import { toast } from "sonner";
import useMenu from "../../../hooks/useMenu";
import { RoleIcons } from "../../users/utils";
import type { UserRoleType } from "../../users/types";

export default function InviteRow({ invite }: { invite: Invite }) {
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);
  const [createInvite, { isLoading: createIsLoading }] =
    useCreateInviteMutation();
  const [revokeInvite, { isLoading: revokeIsLoading }] =
    useRevokeInviteMutation();

  const { isMenuOpen, closeMenu, toggleMenu, menuContainerRef, openButtonRef } =
    useMenu();
  const { email, role } = invite;

  async function reinvite() {
    try {
      await createInvite({
        tripId,
        invite: { email: email.toLowerCase(), role },
      }).unwrap();
      closeMenu();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  async function revoke() {
    try {
      await revokeInvite({ tripId, inviteId: invite.id }).unwrap();
      closeMenu();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  const canResend = ["revoked", "declined", "pending"].includes(invite.status);
  const canRevoke = invite.status === "pending";

  const { statusStyles, Icon, status } = getStatusConfig(
    invite.status,
    new Date(invite.expiresAt),
  );

  const RoleIcon = RoleIcons[role as UserRoleType];

  return (
    <tr className="group hover:bg-surface-muted/30 transition-colors text-sm md:text-current">
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
          <RoleIcon className="hidden md:flex" size={14} />
          {role}
        </div>
      </td>
      <td className="px-2 md:px-6 py-4 text-right">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border  ${statusStyles}`}
        >
          <Icon size={12} className="hidden md:block md:mr-1" />
          {status}
        </span>
      </td>

      <td className="z-10 px-2 md:px-4 py-4 text-right relative">
        <button
          ref={openButtonRef}
          onClick={toggleMenu}
          className="p-1 hover:bg-surface-muted rounded-full transition-colors"
        >
          <MoreVertical size={18} className="text-text-secondary" />
        </button>

        {isMenuOpen && (
          <div
            ref={menuContainerRef}
            className="card absolute z-20 right-8 top-1 w-32 p-0.5 flex flex-col shadow-xl bg-surface "
          >
            {canResend && (
              <button
                disabled={createIsLoading}
                onClick={() => {
                  reinvite();
                }}
                className="rounded-none flex items-center gap-2 p-1 text-xs hover:bg-surface-muted"
              >
                <RotateCcw size={14} /> Resend
              </button>
            )}
            {canRevoke && (
              <button
                disabled={revokeIsLoading}
                onClick={() => {
                  revoke();
                }}
                className="rounded-none flex items-center gap-2 p-1 text-xs hover:bg-surface-muted text-error"
              >
                <Ban size={14} /> Revoke
              </button>
            )}
            {!canResend && !canRevoke && (
              <span className="p-2 text-xs text-text-muted italic text-center">
                No actions
              </span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
