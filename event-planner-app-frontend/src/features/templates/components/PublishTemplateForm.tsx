import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { FormInput, FormSelect, FormTextarea } from "../../../components";
import { DialogFooter } from "../../../components/ui/dialog";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import { TEMPLATE_REGIONS, type TemplateRegion } from "../constants";
import {
  publishTemplateSchema,
  type PublishTemplateSchema,
} from "../schemas/templateSchemas";
import {
  usePublishTripMutation,
  useUnpublishTripMutation,
} from "../services/templatesApiSlice";
import type { PublishStatus } from "../types";

const REGION_OPTIONS = [
  { name: "Choose a region", value: "" },
  ...TEMPLATE_REGIONS.map((region) => ({ name: region, value: region })),
];

interface PublishTemplateFormProps {
  trip: Trip;
  status: PublishStatus;
  onDone: () => void;
}

export default function PublishTemplateForm({
  trip,
  status,
  onDone,
}: PublishTemplateFormProps) {
  const [publishTrip, { isLoading: isPublishing }] = usePublishTripMutation();
  const [unpublishTrip, { isLoading: isUnpublishing }] =
    useUnpublishTripMutation();
  const posthog = usePostHog();
  const { isPublished } = status;
  const { register, handleSubmit, formState } = useForm<PublishTemplateSchema>({
    resolver: yupResolver(publishTemplateSchema),
    defaultValues: {
      title: status.title ?? trip.name,
      description: trip.description ?? "",
      region: status.region ?? "",
    },
  });

  async function onSubmit({
    title,
    description,
    region,
  }: PublishTemplateSchema) {
    try {
      await publishTrip({
        tripId: trip.id,
        region: region as TemplateRegion,
        title: title || undefined,
        description,
      }).unwrap();
      posthog?.capture("template_published", { trip_id: trip.id });
      toast.success(isPublished ? "Template updated." : "Template published.");
      onDone();
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Sorry! Something went wrong...",
      );
    }
  }

  async function onUnpublish() {
    try {
      await unpublishTrip(trip.id).unwrap();
      posthog?.capture("template_unpublished", { trip_id: trip.id });
      toast.success("Template unpublished.");
      onDone();
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Sorry! Something went wrong...",
      );
    }
  }

  return (
    <>
      <p>
        Anyone can view and copy a template without logging in. It includes your
        events, stays, shared packing items and wishlist places, with dates made
        relative to the start. Members, expenses, flights and personal packing
        items are never included. Republish to refresh it after you change the
        trip.
      </p>
      {isPublished && status.slug && (
        <p>
          Published. <Link to={`/templates/${status.slug}`}>View template</Link>{" "}
          · Used {status.cloneCount ?? 0} times
        </p>
      )}
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Title"
          errorMessage={formState.errors.title?.message}
          {...register("title")}
        />
        <FormSelect
          label="Region"
          options={REGION_OPTIONS}
          errorMessage={formState.errors.region?.message}
          {...register("region")}
        />
        <FormTextarea
          label="Description"
          errorMessage={formState.errors.description?.message}
          {...register("description")}
        />
        <DialogFooter>
          {isPublished && (
            <button
              type="button"
              className="btn-error"
              disabled={isUnpublishing || isPublishing}
              onClick={onUnpublish}
            >
              Unpublish
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isPublishing || isUnpublishing}
          >
            {isPublished ? "Update template" : "Publish"}
          </button>
        </DialogFooter>
      </form>
    </>
  );
}
