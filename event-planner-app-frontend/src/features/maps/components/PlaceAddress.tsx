import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function PlaceAddress({
  name,
  address,
  placeId,
}: {
  name: string;
  address: string;
  placeId: string;
}) {
  return (
    <div className="flex gap-2 items-start">
      <p className="text-sm text-text-secondary h-9 line-clamp-2">{address}</p>
      <button
        title="Copy Address"
        className="btn p-1 hover:bg-text-primary/10 rounded transition-colors text-text-primary"
        onClick={() => {
          navigator.clipboard.writeText(address);
          toast.info("Copied!");
        }}
      >
        <Copy size={12} />
      </button>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`}
        target="_blank"
        rel="noreferrer"
        className="btn p-1 hover:bg-brand-primary/10 rounded transition-colors text-brand-primary"
        title="Open in Google Maps"
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
