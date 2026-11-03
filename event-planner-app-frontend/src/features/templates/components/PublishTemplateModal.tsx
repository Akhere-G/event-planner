import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { FormInput, FormTextarea, StateGate } from "../../../components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import {
  publishTemplateSchema,
  type PublishTemplateSchema,
} from "../schemas/templateSchemas";
import {
  useGetPublishStatusQuery,
  usePublishTripMutation,
  useUnpublishTripMutation,
} from "../services/templatesApiSlice";

interface PublishTemplateModalProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublishTemplateModal({
  trip,
  open,
  onOpenChange,
}: PublishTemplateModalProps) {
  const { data, isLoading, isError } = useGetPublishStatusQuery(trip.id);
  const [publishTrip, { isLoading: isPublishing }] = usePublishTripMutation();
  const [unpublishTrip, { isLoading: isUnpublishing }] =
    useUnpublishTripMutation();
  const posthog = usePostHog();
  const { register, handleSubmit, formState } = useForm<PublishTemplateSchema>({
    resolver: yupResolver(publishTemplateSchema),
    defaultValues: { title: trip.name, description: trip.description ?? "" },
  });

  const status = data?.data;
  const isPublished = !!status?.isPublished;

  async function onSubmit({ title, description }: PublishTemplateSchema) {
    try {
      await publishTrip({
        tripId: trip.id,
        title: title || undefined,
        description,
      }).unwrap();
      posthog?.capture("template_published", { trip_id: trip.id });
      toast.success(isPublished ? "Template updated." : "Template published.");
      onOpenChange(false);
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
      onOpenChange(false);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Sorry! Something went wrong...",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>
            {isPublished ? "Update template" : "Publish as template"}
          </DialogTitle>
        </DialogHeader>
        <StateGate
          loadingStateProps={{ isLoading, message: "Checking template..." }}
          errorStateProps={{ isError, message: "Failed to load template." }}
        >
          <DialogDescription>
            Anyone can view and copy a template, without logging in. It includes
            your events, stays, shared packing items and wishlist places, with
            dates made relative to the start. Members, expenses, flights and
            personal packing items are never included.
          </DialogDescription>
          {isPublished && status?.slug && (
            <p>
              Published.{" "}
              <Link to={`/templates/${status.slug}`}>View template</Link> · Used{" "}
              {status.cloneCount ?? 0} times
            </p>
          )}
          <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput
              label="Title"
              errorMessage={formState.errors.title?.message}
              {...register("title")}
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
        </StateGate>
      </DialogContent>
    </Dialog>
  );
}
