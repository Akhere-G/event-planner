import { useForm } from "react-hook-form";
import { FormInput } from "../components";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  tripSchema,
  type TripSchema,
} from "../features/trips/schemas/tripSchema";
import { useAddTripMutation } from "../features/trips/services/tripsApiSlice";
import { isValidationError } from "../features/api/utils";
import { useState } from "react";
import {
  addMilliseconds,
  differenceInMilliseconds,
  format,
  isValid,
  parseISO,
} from "date-fns";
import { useNavigate } from "react-router";

export default function Addtrip() {
  const [errorMessage, setErrorMessage] = useState("");

  const { register, formState, handleSubmit, setError, setValue, getValues } =
    useForm({
      resolver: yupResolver(tripSchema),
    });
  const [addTrip] = useAddTripMutation();
  const navigate = useNavigate();

  const onSubmit = async (formState: TripSchema) => {
    const formattedData = {
      name: formState.name.trim(),
      description: formState.description ? formState.description.trim() : null,
      startDate: format(formState.startDate, "yyyy-MM-dd"),
      endDate: format(formState.endDate, "yyyy-MM-dd"),
    };

    try {
      await addTrip(formattedData).unwrap();
      navigate("/");
    } catch (err) {
      if (isValidationError(err)) {
        console.log("heeere");

        const serverErrors = err.data.error;

        setErrorMessage(serverErrors.general?.join(", ") ?? "");

        Object.entries(serverErrors).forEach(([key, messages]) => {
          setError(key as keyof TripSchema, {
            type: "server",
            message: messages[0],
          });
        });
      }
    }
  };

  const onStartChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
      Element
    >,
  ) => {
    const newStartStr = e.target.value;
    const currentStartStr = getValues("startDate");
    const currentEndStr = getValues("endDate");

    const currentStart = parseISO(currentStartStr);
    const currentEnd = parseISO(currentEndStr);
    const nextStart = parseISO(newStartStr);

    if (isValid(currentStart) && isValid(currentEnd) && isValid(nextStart)) {
      const duration = differenceInMilliseconds(currentEnd, currentStart);

      const nextEnd = addMilliseconds(nextStart, duration);

      setValue("endDate", format(nextEnd, "yyyy-MM-dd"));
    }

    setValue("startDate", newStartStr);
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Add Trip</h2>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && <p className="errorMessage">{errorMessage}</p>}

          <FormInput
            label="Name"
            {...register("name")}
            errorMessage={formState.errors.name?.message}
          />
          <FormInput
            label="Description"
            {...register("description")}
            errorMessage={formState.errors.description?.message}
          />
          <FormInput
            label="Start Date"
            type="date"
            {...register("startDate")}
            errorMessage={formState.errors.startDate?.message}
            onChange={onStartChange}
          />
          <FormInput
            label="End Date"
            type="date"
            {...register("endDate")}
            errorMessage={formState.errors.endDate?.message}
          />
          <button className="btn-primary">Add Trip</button>
        </form>
      </div>
    </div>
  );
}
