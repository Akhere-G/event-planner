import type { Trip } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import { Link } from "react-router";

type TripCardProps = Trip;

export default function TripCard(props: TripCardProps) {
  const { id, name, description, startDate, endDate } = props;
  return (
    <Link to={`/trips/${id}`}>
      <article className="rounded-md bg-surface shadow-md overflow-hidden  ">
        <div className="p-4  bg-linear-to-r from-brand-primary to-brand-secondary h-40">
          <h3 className="text-white text-lg mb-2 font-bold ">{name}</h3>
          <p className="text-surface-muted truncate">{description}</p>
        </div>
        <p className="p-4 text-text-primary">
          {formatDateRange(startDate, endDate)}
        </p>
      </article>
    </Link>
  );
}
