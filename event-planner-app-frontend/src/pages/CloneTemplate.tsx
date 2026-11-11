import { useEffect } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { StateGate } from "../components";
import { selectIsDemo } from "../features/auth/services/authSlice";
import CloneTemplateForm from "../features/templates/components/CloneTemplateForm";
import { useGetTemplateQuery } from "../features/templates/services/templatesApiSlice";

const DEMO_MESSAGE =
  "Create an account to clone this template. Log out of the demo from the menu, then register.";

export default function CloneTemplate() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useGetTemplateQuery(slug);
  const isDemo = useSelector(selectIsDemo);

  useEffect(() => {
    if (isDemo) {
      toast.info(DEMO_MESSAGE, { id: "demo-clone" });
    }
  }, [isDemo]);

  return (
    <div className="container">
      <StateGate
        loadingStateProps={{ isLoading, message: "Loading template..." }}
        errorStateProps={{
          isError,
          message: "This template could not be found.",
        }}
        emptyStateProps={{ isEmpty: isDemo, message: DEMO_MESSAGE }}
      >
        {data && <CloneTemplateForm template={data.data} />}
      </StateGate>
    </div>
  );
}
