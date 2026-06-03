interface ToggleButtonProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: (value: string) => void;
  icon: React.ComponentType<{ className?: string }>;
}

export default function ToggleButton({
  label,
  value,
  isSelected,
  onClick,
  icon: Icon,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      aria-pressed={isSelected}
      className={`
        px-3 py-3 rounded-xl border text-sm font-medium tracking-wide transition-all duration-150 cursor-pointer w-full
        flex flex-col items-center justify-center gap-2 text-center
        ${
          isSelected
            ? "bg-brand-primary text-text-inverse border-transparent shadow-sm scale-[0.98]"
            : "bg-surface text-text-primary border-surface-border hover:bg-surface-muted"
        }
      `}
    >
      <Icon
        className={`h-4 w-4 ${isSelected ? "text-text-inverse" : "text-text-secondary"}`}
      />
      <span>{label}</span>
    </button>
  );
}
