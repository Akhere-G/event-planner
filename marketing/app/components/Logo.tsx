export function Logo({
  light = false,
  size = 20,
}: {
  light?: boolean;
  size?: number;
}) {
  return (
    <span
      className="font-outfit font-bold tracking-tight"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span className={light ? "text-white" : "text-[#1C1410]"}>Trip</span>
      <span className="text-brand-primary">Track</span>
    </span>
  );
}
