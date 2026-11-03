import { useDayViewers } from "../usePresence";

export default function DayViewers({ date }: { date: string }) {
  const viewers = useDayViewers(date);
  if (!viewers.length) return null;

  return (
    <span
      className="flex items-center gap-1 text-xs text-text-secondary"
      title={`${viewers.map((v) => v.name).join(", ")} viewing`}
    >
      <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
      {viewers.length === 1 ? viewers[0].name : `${viewers.length} viewing`}
    </span>
  );
}
