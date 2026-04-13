import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";

type TripCardProps = Trip;

export default function TripCard(props: TripCardProps) {
  const { name, description, startDate, endDate } = props;
  return (
    <article className="rounded-md bg-surface shadow-md overflow-hidden  ">
      <div className="p-4  bg-linear-to-r from-brand-primary to-brand-secondary ">
        <h3 className="text-white text-xl mb-2 font-bold h-30">{name}</h3>
        <p className="text-surface-muted truncate">{description}</p>
      </div>
      <p className="p-4 ">{formatDateRange(startDate, endDate)}</p>
    </article>
  );
}
