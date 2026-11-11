import { yupResolver } from "@hookform/resolvers/yup";
import { usePostHog } from "@posthog/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { FormTextarea } from "../../../components";
import { isApiError, isValidationError } from "../../api/utils";
import useRememberCreatedTrip from "../../trips/hooks/useRememberCreatedTrip";
import { useAddTripFromPromptMutation } from "../../trips/services/tripsApiSlice";
import { PLANNING_STARTED_MESSAGE } from "../constants";
import {
  tripPromptSchema,
  type TripPromptValues,
} from "../schemas/tripPromptSchema";

interface TripPromptFormProps {
  disabled: boolean;
}

export default function TripPromptForm({ disabled }: TripPromptFormProps) {
  const [addTripFromPrompt, { isLoading }] = useAddTripFromPromptMutation();
  const rememberCreatedTrip = useRememberCreatedTrip();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TripPromptValues>({
    resolver: yupResolver(tripPromptSchema),
    defaultValues: { prompt: "" },
  });

  const submit = handleSubmit(async ({ prompt }) => {
    try {
      const { data: trip } = await addTripFromPrompt(prompt).unwrap();
      rememberCreatedTrip(trip, "prompt");
      toast.success(PLANNING_STARTED_MESSAGE);
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      if (isValidationError(err)) {
        setError("prompt", {
          type: "server",
          message: err.data.error.prompt?.[0],
        });
        return;
      }
      posthog?.captureException(err);
      toast.error(
        isApiError(err) ? err.data.message : "Could not create your trip.",
      );
    }
  });

  return (
    <form className="form" onSubmit={submit}>
      <FormTextarea
        label="Describe your trip and AI will plan it"
        placeholder="e.g. A relaxed foodie week in Lisbon in June for two, around £1,500"
        {...register("prompt")}
        errorMessage={errors.prompt?.message}
        formClassNames="mb-2"
      />
      <button className="btn-primary" disabled={disabled || isLoading}>
        {isLoading ? "Creating your trip…" : "Plan my trip"}
      </button>
    </form>
  );
}
