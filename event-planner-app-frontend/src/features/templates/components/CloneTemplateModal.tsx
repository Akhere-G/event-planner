import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { FormInput } from "../../../components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { isApiError, isValidationError } from "../../api/utils";
import {
  cloneTemplateSchema,
  type CloneTemplateSchema,
} from "../schemas/templateSchemas";
import { useCloneTemplateMutation } from "../services/templatesApiSlice";
import { dateInputValue } from "../utils";

interface CloneTemplateModalProps {
  slug: string;
  title: string;
  durationDays: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CloneTemplateModal({
  slug,
  title,
  durationDays,
  open,
  onOpenChange,
}: CloneTemplateModalProps) {
  const [cloneTemplate, { isLoading }] = useCloneTemplateMutation();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const { register, handleSubmit, formState, setError } =
    useForm<CloneTemplateSchema>({
      resolver: yupResolver(cloneTemplateSchema),
      defaultValues: { startDate: dateInputValue(7) },
    });

  async function onSubmit({ startDate }: CloneTemplateSchema) {
    try {
      const result = await cloneTemplate({ slug, startDate }).unwrap();
      posthog?.capture("template_cloned", {
        slug,
        trip_id: result.data.id,
      });
      toast.success(`Created "${result.data.name}". Happy planning!`);
      onOpenChange(false);
      navigate(`/trips/${result.data.id}`);
    } catch (err) {
      if (isValidationError(err) && typeof err.data.error === "object") {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>Use this template</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {`"${title}" will be copied to a new trip of ${durationDays} ${durationDays === 1 ? "day" : "days"} that only you can see. Pick the day it starts.`}
        </DialogDescription>
        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            label="Start date"
            type="date"
            errorMessage={formState.errors.startDate?.message}
            {...register("startDate")}
          />
          <DialogFooter>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create trip"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
