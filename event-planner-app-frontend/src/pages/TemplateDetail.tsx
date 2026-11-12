import { Link, useParams } from "react-router";
import { CalendarDays, Copy, MapPin } from "lucide-react";
import { StateGate } from "../components";
import TemplateCover from "../features/templates/components/TemplateCover";
import TemplateDetailMap from "../features/templates/components/TemplateDetailMap";
import TemplateItinerary from "../features/templates/components/TemplateItinerary";
import { useGetTemplateQuery } from "../features/templates/services/templatesApiSlice";
import { durationLabel } from "../features/templates/utils";

export default function TemplateDetail() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useGetTemplateQuery(slug);
  const template = data?.data;

  return (
    <div className="container flex flex-col gap-6">
      <StateGate
        loadingStateProps={{ isLoading, message: "Loading template..." }}
        errorStateProps={{
          isError,
          message: "This template could not be found.",
        }}
      >
        {template && (
          <>
            <div className="card p-0 overflow-hidden">
              <TemplateCover
                src={template.coverImage}
                alt={`${template.destination} cover`}
                className="h-40 md:h-56 w-full"
              />
              <div className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="title">{template.title}</h2>
                  <p className="text-text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} aria-hidden /> {template.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={16} aria-hidden />
                      {durationLabel(template.durationDays)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy size={16} aria-hidden /> Used {template.cloneCount}{" "}
                      {template.cloneCount === 1 ? "time" : "times"}
                    </span>
                    {template.authorName && (
                      <span>by {template.authorName}</span>
                    )}
                  </p>
                  {template.description && <p>{template.description}</p>}
                </div>
                <Link
                  to={`/templates/${template.slug}/clone`}
                  className="btn btn-primary shrink-0 text-center"
                >
                  Clone this trip
                </Link>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <TemplateItinerary template={template} />
              <div className="h-80 md:h-[80vh] md:sticky md:top-4 rounded-md overflow-hidden">
                <TemplateDetailMap template={template} />
              </div>
            </div>
          </>
        )}
      </StateGate>
    </div>
  );
}
