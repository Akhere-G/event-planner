export interface EmptyStateProps {
  message?: string;
  height?: number;
  actions?: { text: string; onClick: () => void; className?: string }[];
}

export default function EmptyState({
  message = "No data found.",
  height = 200,
  actions,
}: EmptyStateProps) {
  return (
    <div
      style={{ height: height + "px" }}
      className={`bg-surface border-dashed border-surface-border border-2 rounded-md flex flex-col gap-4 justify-center items-center`}
    >
      <h2 className="text-text-secondary title">{message}</h2>
      <div className="flex gap-4 flex-wrap flex-col md:flex-row items-stretch justify-center">
        {actions &&
          actions.map((action) => (
            <button
              className={`text-brand-primary cursor-pointer p-0 m-0 ${action.className}`}
              onClick={action.onClick}
            >
              {action.text}
            </button>
          ))}
      </div>
    </div>
  );
}
