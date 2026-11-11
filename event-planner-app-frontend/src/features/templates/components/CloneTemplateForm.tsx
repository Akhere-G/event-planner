import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router";
import { addDays, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { FormInput } from "../../../components";
import { isApiError, isValidationError } from "../../api/utils";
import {
  cloneTemplateSchema,
  type CloneTemplateSchema,
} from "../schemas/templateSchemas";
import { useCloneTemplateMutation } from "../services/templatesApiSlice";
import type { TemplateDetail } from "../types";
import { dateInputValue, durationLabel } from "../utils";

const DEFAULT_START_IN_DAYS = 30;

export default function CloneTemplateForm({
  template,
}: {
  template: TemplateDetail;
}) {
  const [cloneTemplate, { isLoading }] = useCloneTemplateMutation();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const { register, handleSubmit, formState, setError, control } =
    useForm<CloneTemplateSchema>({
      resolver: yupResolver(cloneTemplateSchema),
      defaultValues: { startDate: dateInputValue(DEFAULT_START_IN_DAYS) },
    });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ? format(
        addDays(parseISO(startDate), template.durationDays - 1),
        "EEE d MMM yyyy",
      )
    : null;

  async function onSubmit(values: CloneTemplateSchema) {
    try {
      const result = await cloneTemplate({
        slug: template.slug,
        startDate: values.startDate,
      }).unwrap();
      posthog?.capture("template_cloned", {
        slug: template.slug,
        trip_id: result.data.id,
      });
      toast.success(`Created "${result.data.name}". Happy planning!`);
      navigate(`/trips/${result.data.id}`);
    } catch (err) {
      if (isValidationError(err)) {
        const messages = err.data.error.startDate ?? err.data.error.start_date;
        if (messages?.[0]) {
          setError("startDate", { type: "server", message: messages[0] });
          return;
        }
      }
      toast.error(
        isApiError(err) ? err.data.message : "Sorry! Something went wrong...",
      );
    }
  }

  return (
    <form
      className="card form max-w-xl mx-auto"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h2 className="title">Clone this trip</h2>
      <p className="text-text-secondary">
        {`"${template.title}" will be copied into a new ${durationLabel(template.durationDays)} trip that only you can see. Pick the day it starts and every event will move to match, at the same local times.`}
      </p>
      <FormInput
        label="Start date"
        type="date"
        errorMessage={formState.errors.startDate?.message}
        {...register("startDate")}
      />
      {endDate && (
        <p className="text-sm text-text-secondary">Ends on {endDate}.</p>
      )}
      <div className="flex justify-end gap-2">
        <Link
          to={`/templates/${template.slug}`}
          className="btn btn-secondary text-text-primary"
        >
          Back
        </Link>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create trip"}
        </button>
      </div>
    </form>
  );
}
