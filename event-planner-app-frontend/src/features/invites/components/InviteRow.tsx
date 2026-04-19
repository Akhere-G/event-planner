import {
  Ban,
  CheckCircle2,
  CircleQuestionMark,
  Clock,
  Mail,
  MoreVertical,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Invite } from "../types";
import { useEffect, useRef, useState } from "react";
import {
  useCreateInviteMutation,
  useRevokeInviteMutation,
} from "../services/inviteApiSlice";
import { useMatch } from "react-router";
import { isValidationError } from "../../api/utils";

export default function InviteRow({ invite }: { invite: Invite }) {
  const { params } = useMatch("/trips/:tripId");
  const tripId = Number(params.tripId);
  const [createInvite] = useCreateInviteMutation();
  const [revokeInvite] = useRevokeInviteMutation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { email, role, status } = invite;

  async function reinvite() {
    try {
      createInvite({
        tripId,
        invite: { email: invite.email, role: invite.role },
      }).unwrap();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        console.error(serverErrors);
        //TODO: create toast notification  -  serverErrors.general?.join(", ") ?? ""
      }
    }
  }

  async function revoke() {
    try {
      revokeInvite({ tripId, inviteId: invite.id }).unwrap();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        console.error(serverErrors);
        //TODO: create toast notification  -  serverErrors.general?.join(", ") ?? ""
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

  const canResend = ["revoked", "declined", "pending"].includes(status);
  const canRevoke = status === "pending";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          statusStyles: "bg-amber-100 text-amber-700 border-amber-200",
          Icon: Clock,
        };
      case "accepted":
        return {
          statusStyles: "bg-emerald-100 text-emerald-700 border-emerald-200",
          Icon: CheckCircle2,
        };
      case "declined":
        return {
          statusStyles: "bg-rose-100 text-rose-700 border-rose-200",
          Icon: XCircle,
        };
      case "revoked":
        return {
          statusStyles:
            "bg-slate-100 text-slate-700 border-slate-200 opacity-75",
          Icon: Ban,
        };
      default:
        return {
          statusStyles: "bg-gray-100 text-gray-700 border-gray-200",
          Icon: CircleQuestionMark,
        };
    }
  };

  const { statusStyles, Icon } = getStatusConfig(status);

  return (
    <tr className="group hover:bg-surface-muted/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-brand-primary/10 text-brand-primary">
            <Mail size={16} />
          </div>
          <span>{email}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-1.5 text-sm text-text-secondary capitalize">
          <ShieldCheck size={14} />
          {role}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border  ${statusStyles}`}
        >
          <Icon size={12} className="mr-1" />
          {status}
        </span>
      </td>
      <td className="px-4 py-4 text-right relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:bg-surface-muted rounded-full transition-colors"
        >
          <MoreVertical size={18} className="text-text-secondary" />
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="card absolute z-20 right-4 top-12 w-32 p-1 flex flex-col shadow-xl bg-surface"
          >
            {canResend && (
              <button
                onClick={() => {
                  reinvite();
                  setIsMenuOpen(false);
                }}
                className="rounded-none flex items-center gap-2 p-2 text-sm hover:bg-surface-muted"
              >
                <RotateCcw size={14} /> Resend
              </button>
            )}
            {canRevoke && (
              <button
                onClick={() => {
                  //TODO: Handle Revoke
                  revoke();
                  setIsMenuOpen(false);
                }}
                className="rounded-none flex items-center gap-2 p-2 text-sm hover:bg-surface-muted text-error"
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
