import { getAvatarColor } from "../../users/utils";
import { useOtherPresence } from "../usePresence";

const MAX_SHOWN = 4;

export default function PresenceAvatars() {
  const others = useOtherPresence();
  if (!others.length) return null;

  const shown = others.slice(0, MAX_SHOWN);
  const extra = others.length - shown.length;

  return (
    <div
      className="flex items-center"
      aria-label={`${others.length} other ${others.length === 1 ? "person" : "people"} viewing this trip`}
    >
      <span className="relative mr-2 flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <div className="flex pr-2">
        {shown.map((user) => (
          <div
            key={user.userId ?? user.name}
            title={user.name}
            style={{ backgroundColor: getAvatarColor(user.userId ?? 0) }}
            className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-sm font-bold text-text-inverse"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {extra > 0 && (
          <div className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-muted text-xs font-bold text-text-primary">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
}
