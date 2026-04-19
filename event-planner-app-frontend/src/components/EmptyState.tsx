export interface EmptyStateProps {
  message?: string;
  height?: number;
  action?: { text: string; onClick: () => void };
}

export default function EmptyState({
  message = "No data found.",
  height = 200,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{ height: height + "px" }}
      className={`bg-surface border-dashed border-slate-300 border-2 rounded-md flex flex-col gap-4 justify-center items-center`}
    >
      <h2 className="text-text-secondary">{message}</h2>
      {action && (
        <p
          className="text-brand-primary cursor-pointer"
          onClick={action.onClick}
        >
          {action.text}
        </p>
      )}
    </div>
  );
}
