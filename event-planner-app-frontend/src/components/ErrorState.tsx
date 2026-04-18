export default function ErrorState({
  message = "Sorry... something went wrong.",
  showReload,
}: {
  message?: string;
  showReload?: boolean;
}) {
  return (
    <div className="bg-error/10 min-h-50 border-dashed border-error/50 border-2 rounded-md flex flex-col gap-4 justify-center items-center">
      <h2 className="text-error">{message}</h2>
      {showReload && (
        <button
          className="text-primary cursor-pointer"
          onClick={() => window.location.reload()}
        >
          Reload?
        </button>
      )}
    </div>
  );
}
