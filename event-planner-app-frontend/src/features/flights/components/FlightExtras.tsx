export default function FlightExtras({ extras }: { extras: string[] }) {
  if (extras.length === 0) return null;

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-text-secondary hover:text-text-primary">
        Flight details
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-text-secondary">
        {extras.map((extra) => (
          <li key={extra}>{extra}</li>
        ))}
      </ul>
    </details>
  );
}
