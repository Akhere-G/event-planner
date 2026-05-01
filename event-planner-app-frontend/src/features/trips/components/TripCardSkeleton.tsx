export default function TripCardSkeleton() {
  return (
    <article className="md:rounded-md bg-surface shadow-md overflow-hidden  ">
      <div className="p-4  bg-linear-to-r from-brand-primary to-brand-secondary h-40 ">
        <div className="bg-white  rounded-md h-5 w-28 animate-pulse mb-5" />

        <div className="bg-text-inverse/85 rounded-md h-4 w-23 animate-pulse" />
      </div>
      <div className="h-14 flex items-center p-4">
        <div className="bg-text-primary rounded-md h-5 w-28 animate-pulse" />
      </div>
    </article>
  );
}
