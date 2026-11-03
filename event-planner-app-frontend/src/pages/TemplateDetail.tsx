import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { APIProvider } from "@vis.gl/react-google-maps";
import { StateGate } from "../components";
import { selectIsAuthenticated } from "../features/auth/services/authSlice";
import CloneTemplateModal from "../features/templates/components/CloneTemplateModal";
import TemplateItinerary from "../features/templates/components/TemplateItinerary";
import TemplateMap from "../features/templates/components/TemplateMap";
import { useGetTemplateQuery } from "../features/templates/services/templatesApiSlice";
import { durationLabel } from "../features/templates/utils";

const mapsAPIKey = "AIzaSyAzLmSK-RsggriUFdkHmir3A3kzJp4iyGU";

export default function TemplateDetail() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useGetTemplateQuery(slug);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [cloneOpen, setCloneOpen] = useState(false);
  const template = data?.data;

  function useTemplate() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/templates/${slug}` } });
      return;
    }
    setCloneOpen(true);
  }

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
            <div className="card flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="title">{template.title}</h2>
                <p className="text-text-secondary">
                  {template.destination} · {durationLabel(template.durationDays)}
                  {template.authorName ? ` · by ${template.authorName}` : ""}
                </p>
                {template.description && (
                  <p className="mt-2">{template.description}</p>
                )}
              </div>
              <button className="btn-primary shrink-0" onClick={useTemplate}>
                Use this template
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <TemplateItinerary template={template} />
              <APIProvider apiKey={mapsAPIKey} libraries={["places"]}>
                <TemplateMap template={template} />
              </APIProvider>
            </div>
            {cloneOpen && (
              <CloneTemplateModal
                open
                onOpenChange={setCloneOpen}
                slug={template.slug}
                title={template.title}
                durationDays={template.durationDays}
              />
            )}
          </>
        )}
      </StateGate>
    </div>
  );
}
