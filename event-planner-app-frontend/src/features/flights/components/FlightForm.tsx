import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput, FormTextarea } from "../../../components";
import { isValidationError } from "../../api/utils";
import type { User } from "../../users/types";
import {
  useCreateFlightMutation,
  useUpdateFlightMutation,
} from "../flightApiSlice";
import { flightSchema, type FlightSchema } from "../schemas/flightSchema";
import type { Flight } from "../types";
import {
  defaultFlightLocalTimes,
  localInputToUtc,
  supportedTimeZones,
  utcToLocalInput,
} from "../utils";

interface FlightFormProps {
  tripId: number;
  tripStart: string;
  members: User[];
  flight?: Flight | null;
  onSuccess?: () => void;
  onCancel: () => void;
}

const TIME_ZONE_LIST_ID = "flight-time-zones";

export default function FlightForm({
  tripId,
  tripStart,
  members,
  flight = null,
  onSuccess = () => {},
  onCancel,
}: FlightFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [createFlight, { isLoading: isCreating }] = useCreateFlightMutation();
  const [updateFlight, { isLoading: isUpdating }] = useUpdateFlightMutation();
  const isEditing = !!flight;

  const defaults = defaultFlightLocalTimes(tripStart);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<FlightSchema>({
    resolver: yupResolver(flightSchema),
    mode: "onSubmit",
    defaultValues: {
      airline: flight?.airline ?? "",
      flightNumber: flight?.flightNumber ?? "",
      departureAirport: flight?.departureAirport ?? "",
      arrivalAirport: flight?.arrivalAirport ?? "",
      departureTimezone: flight?.departureTimezone ?? "",
      arrivalTimezone: flight?.arrivalTimezone ?? "",
      departAt: flight
        ? utcToLocalInput(flight.departAt, flight.departureTimezone)
        : defaults.depart,
      arriveAt: flight
        ? utcToLocalInput(flight.arriveAt, flight.arrivalTimezone)
        : defaults.arrive,
      bookingRef: flight?.bookingRef ?? "",
      seat: flight?.seat ?? "",
      notes: flight?.notes ?? "",
      travellers: flight?.travellers ?? [],
    },
  });

  const travellers = useWatch({ control, name: "travellers" }) ?? [];

  const toggleTraveller = (userId: number) => {
    setValue(
      "travellers",
      travellers.includes(userId)
        ? travellers.filter((id) => id !== userId)
        : [...travellers, userId],
    );
  };

  const onSubmit = async (form: FlightSchema) => {
    setErrorMessage("");
    const payload = {
      airline: form.airline,
      flightNumber: form.flightNumber,
      departureAirport: form.departureAirport,
      arrivalAirport: form.arrivalAirport,
      departureTimezone: form.departureTimezone,
      arrivalTimezone: form.arrivalTimezone,
      departAt: localInputToUtc(form.departAt, form.departureTimezone),
      arriveAt: localInputToUtc(form.arriveAt, form.arrivalTimezone),
      bookingRef: form.bookingRef || null,
      seat: form.seat || null,
      notes: form.notes || null,
      travellers: form.travellers,
    };

    try {
      if (flight) {
        await updateFlight({
          tripId,
          flightId: flight.id,
          ...payload,
        }).unwrap();
        toast.success("Flight updated!");
      } else {
        await createFlight({ tripId, ...payload }).unwrap();
        toast.success("Flight added!");
      }
      onSuccess();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        setErrorMessage(serverErrors.general?.join(", ") ?? "");
        Object.entries(serverErrors).forEach(([key, messages]) => {
          setError(key as keyof FlightSchema, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error("Failed to save flight");
      }
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      aria-label={isEditing ? "Update flight" : "New flight"}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-text-main">
          {isEditing ? "Update Flight" : "New Flight"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close flight form"
          className="text-text-secondary hover:text-text-primary p-1 -mr-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput
          label="Airline"
          {...register("airline")}
          errorMessage={errors.airline?.message}
        />
        <FormInput
          label="Flight number"
          placeholder="BA117"
          {...register("flightNumber")}
          errorMessage={errors.flightNumber?.message}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-text-secondary mb-2">
            Departure
          </legend>
          <FormInput
            label="Airport (IATA)"
            placeholder="LHR"
            maxLength={3}
            {...register("departureAirport")}
            errorMessage={errors.departureAirport?.message}
          />
          <FormInput
            label="Timezone"
            placeholder="Europe/London"
            list={TIME_ZONE_LIST_ID}
            {...register("departureTimezone")}
            errorMessage={errors.departureTimezone?.message}
          />
          <FormInput
            type="datetime-local"
            label="Departs (local time)"
            {...register("departAt")}
            errorMessage={errors.departAt?.message}
          />
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-text-secondary mb-2">
            Arrival
          </legend>
          <FormInput
            label="Airport (IATA)"
            placeholder="JFK"
            maxLength={3}
            {...register("arrivalAirport")}
            errorMessage={errors.arrivalAirport?.message}
          />
          <FormInput
            label="Timezone"
            placeholder="America/New_York"
            list={TIME_ZONE_LIST_ID}
            {...register("arrivalTimezone")}
            errorMessage={errors.arrivalTimezone?.message}
          />
          <FormInput
            type="datetime-local"
            label="Arrives (local time)"
            {...register("arriveAt")}
            errorMessage={errors.arriveAt?.message}
          />
        </fieldset>
      </div>
      <datalist id={TIME_ZONE_LIST_ID}>
        {supportedTimeZones().map((zone) => (
          <option key={zone} value={zone} />
        ))}
      </datalist>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput
          label="Booking reference"
          {...register("bookingRef")}
          errorMessage={errors.bookingRef?.message}
        />
        <FormInput
          label="Seat"
          {...register("seat")}
          errorMessage={errors.seat?.message}
        />
      </div>

      {members.length > 0 && (
        <fieldset>
          <legend className="text-xs text-text-secondary pb-1">
            Travellers
          </legend>
          <div className="flex flex-wrap gap-3">
            {members.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-2 text-sm text-text-main"
              >
                <input
                  type="checkbox"
                  checked={travellers.includes(member.id)}
                  onChange={() => toggleTraveller(member.id)}
                />
                {member.username}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <FormTextarea
        label="Notes"
        {...register("notes")}
        errorMessage={errors.notes?.message}
        formClassNames="w-full"
      />

      {errorMessage && <p className="text-xs text-error">{errorMessage}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="flex-1 btn-primary"
        >
          {isEditing ? "Update" : "Add Flight"}
        </button>
      </div>
    </form>
  );
}
