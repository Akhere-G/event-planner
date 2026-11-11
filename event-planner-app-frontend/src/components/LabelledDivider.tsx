interface LabelledDividerProps {
  label: string;
}

export default function LabelledDivider({ label }: LabelledDividerProps) {
  return (
    <div
      role="separator"
      className="flex items-center gap-3 my-4 text-sm text-text-secondary"
    >
      <span className="flex-1 border-t border-surface-border" />
      {label}
      <span className="flex-1 border-t border-surface-border" />
    </div>
  );
}
