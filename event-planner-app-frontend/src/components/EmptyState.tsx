export default function EmptyState({
  message = "No data found.",
  action,
}: {
  message?: string;
  action?: { text: string; onClick: () => void };
}) {
  return (
    <div className="bg-surface min-h-50 border-dashed border-slate-300 border-2 rounded-md flex flex-col gap-4 justify-center items-center">
      <h2 className="text-2xl text-text-secondary">{message}</h2>
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
