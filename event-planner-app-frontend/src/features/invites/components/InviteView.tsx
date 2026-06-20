import { useMatch } from "react-router";
import { useGetInvitesQuery } from "../services/inviteApiSlice";
import { StateGate } from "../../../components";
import InviteUserForm from "./InviteUserForm";
import Invites from "./Invites";
import { Copy, ShieldCheck, User, Users } from "lucide-react";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { toast } from "sonner";
import { UserRole } from "../../users/types";

export default function InvitesView() {
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);

  const { data, isLoading, isError } = useGetInvitesQuery(tripId);
  const { data: tripData } = useGetTripQuery(tripId);

  const copyToClipboard = async (
    role: (typeof UserRole)[keyof typeof UserRole],
  ) => {
    const codes = {
      [UserRole.ADMIN]: tripData?.data.adminCode,
      [UserRole.EDITOR]: tripData?.data.editorCode,
      [UserRole.VIEWER]: tripData?.data.viewerCode,
    };

    const link = `${window.location.origin}/join/${codes[role]}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success(`Copied ${role} link to clipboard!`);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="space-y-8">
      <StateGate
        loadingStateProps={{ isLoading }}
        errorStateProps={{ isError }}
      >
        <Invites invites={data?.data.invites ?? []} />
      </StateGate>

      {!isError && !isLoading && (
        <div className="space-y-6">
          <section className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="title mb-4">Invite via Link</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AccessLinkCard
                role={UserRole.ADMIN}
                onCopy={() => copyToClipboard(UserRole.ADMIN)}
              />
              <AccessLinkCard
                role={UserRole.EDITOR}
                onCopy={() => copyToClipboard(UserRole.EDITOR)}
              />
              <AccessLinkCard
                role={UserRole.VIEWER}
                onCopy={() => copyToClipboard(UserRole.VIEWER)}
              />
            </div>
            <p className="text-xs text-text-secondary mt-4 italic">
              Warning: These links grant access to your trip. Only share with
              trusted individuals.
            </p>
          </section>

          <section className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="title mb-4">Invite by Email</h2>
            <InviteUserForm />
          </section>
        </div>
      )}
    </div>
  );
}

function AccessLinkCard({
  onCopy,
  role,
}: {
  onCopy: () => void;
  role: (typeof UserRole)[keyof typeof UserRole];
}) {
  const icons = {
    [UserRole.ADMIN]: <ShieldCheck size={20} />,
    [UserRole.EDITOR]: <User size={20} />,
    [UserRole.VIEWER]: <Users size={20} />,
  };

  return (
    <button
      onClick={onCopy}
      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted transition-colors text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-brand-primary">{icons[role]}</span>
        <span className="font-medium capitalize">{role}</span>
      </div>
      <Copy className="text-text-secondary" size={16} />
    </button>
  );
}
