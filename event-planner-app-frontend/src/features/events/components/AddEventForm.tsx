import { useForm } from "react-hook-form";
import { FormInput } from "../../../components";
import { yupResolver } from "@hookform/resolvers/yup";
import { eventSchema, type EventSchema } from "../schemas/eventSchema";

export default function AddEventForm({ date }: { date: string }) {
  const { register, formState, handleSubmit } = useForm({
    resolver: yupResolver(eventSchema),
  });
  function onSubmit(formState: EventSchema) {
    const data = {
      ...formState,
      name: formState.location,
      startTime: `${date} ${formState.startTime}`,
      endTime: `${date} ${formState.endTime}`,
    };
    console.log(data);
  }
  return (
    <form className="flex gap-2 items-end" onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Location"
        {...register("location")}
        errorMessage={formState.errors.location?.message}
        formClassNames="flex-[0.7]"
        tooltipErrors
      />
      <FormInput
        type="time"
        label="Start Time"
        {...register("startTime")}
        errorMessage={formState.errors.startTime?.message}
        formClassNames="flex-[0.15]"
        tooltipErrors
      />
      <FormInput
        type="time"
        label="End Time"
        {...register("endTime")}
        errorMessage={formState.errors.endTime?.message}
        formClassNames="flex-[0.15]"
        tooltipErrors
      />
      <button className="btn-primary h-12">Add</button>
    </form>
  );
}
/*
name: Mapped[str] = mapped_column(String(255));
description: Mapped[Optional[str]] = mapped_column(String, (nullable = True));
location: Mapped[str] = mapped_column(String);
start_time: Mapped[datetime] = mapped_column(DateTime);
end_time: Mapped[datetime] = mapped_column(DateTime);
*/
