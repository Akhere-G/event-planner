import { Ban, Mail, MoreVertical, RotateCcw, ShieldCheck } from "lucide-react";
import type { Invite } from "../types";
import { useEffect, useRef, useState } from "react";
import {
  useCreateInviteMutation,
  useRevokeInviteMutation,
} from "../services/inviteApiSlice";
import { useMatch } from "react-router";
import { isFetchBaseQueryError } from "../../api/utils";
import { getStatusConfig } from "../utils";
import { toast } from "sonner";

export default function InviteRow({ invite }: { invite: Invite }) {
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);
  const [createInvite] = useCreateInviteMutation();
  const [revokeInvite] = useRevokeInviteMutation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLTableCellElement>(null);
  const { email, role } = invite;

  async function reinvite() {
    try {
      createInvite({
        tripId,
        invite: { email: email.toLowerCase(), role },
      }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  async function revoke() {
    try {
      revokeInvite({ tripId, inviteId: invite.id }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error((err.data as { message: string }).message);
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const canResend = ["revoked", "declined", "pending"].includes(invite.status);
  const canRevoke = invite.status === "pending";

  const { statusStyles, Icon, status } = getStatusConfig(
    invite.status,
    new Date(invite.expiresAt),
  );

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
          <ShieldCheck className="hidden md:flex" size={14} />
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

      <td ref={menuRef} className="z-10 px-2 md:px-4 py-4 text-right relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:bg-surface-muted rounded-full transition-colors"
        >
          <MoreVertical size={18} className="text-text-secondary" />
        </button>

        {isMenuOpen && (
          <div className="card absolute z-20 right-8 top-1 w-32 p-0.5 flex flex-col shadow-xl bg-surface ">
            {canResend && (
              <button
                onClick={() => {
                  reinvite();
                  setIsMenuOpen(false);
                }}
                className="rounded-none flex items-center gap-2 p-1 text-xs hover:bg-surface-muted"
              >
                <RotateCcw size={14} /> Resend
              </button>
            )}
            {canRevoke && (
              <button
                onClick={() => {
                  revoke();
                  setIsMenuOpen(false);
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
