import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { FormInput, FormSelect } from "../../../components";
import type { RootState } from "../../../store";
import { isApiError } from "../../api/utils";
import { useGetAccommodationsQuery } from "../../accommodations/accomodationApiSlice";
import useTripEvents from "../../events/hooks/useTripEvents";
import { useGetFlightsQuery } from "../../flights/flightApiSlice";
import type { Trip } from "../../trips/types";
import { expenseSchema, type ExpenseFormValues } from "../schema";
import {
  useAddExpenseMutation,
  useUpdateExpenseMutation,
} from "../services/expenseApiSlice";
import useDeleteExpense from "../hooks/useDeleteExpense";
import { expenseCategories, type Expense, type ExpensePrefill } from "../types";
import { canChangeExpense, payerOptions } from "../utils";

const splitOptions = [
  { name: "Split evenly between everyone", value: "even_all" },
  { name: "Split between selected people", value: "selected" },
  { name: "Only for the payer", value: "self" },
];

const linkOptions = [
  { name: "Not linked", value: "none" },
  { name: "An event", value: "event" },
  { name: "An accommodation", value: "accommodation" },
  { name: "A flight", value: "flight" },
];

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ExpenseForm({
  trip,
  expense,
  prefill,
  onSuccess,
  onCancel,
}: {
  trip: Trip;
  expense?: Expense;
  prefill?: ExpensePrefill;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { events } = useTripEvents(trip.id);
  const { data: accommodationData } = useGetAccommodationsQuery(trip.id);
  const { data: flightData } = useGetFlightsQuery(trip.id);
  const { remove, isDeleting } = useDeleteExpense(trip.id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [addExpense, { isLoading: isAdding }] = useAddExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const eventId = expense?.eventId ?? prefill?.eventId ?? null;
  const accommodationId =
    expense?.accommodationId ?? prefill?.accommodationId ?? null;
  const flightId = expense?.flightId ?? prefill?.flightId ?? null;

  const { register, handleSubmit, watch, setValue, formState } =
    useForm<ExpenseFormValues>({
      resolver: yupResolver(expenseSchema),
      defaultValues: {
        description: expense?.description ?? prefill?.description ?? "",
        amount: expense?.amount,
        category: expense?.category ?? prefill?.category ?? "other",
        spentOn:
          expense?.spentOn ??
          prefill?.spentOn ??
          format(new Date(), "yyyy-MM-dd"),
        paidById: expense?.paidById ?? userId ?? trip.userMemberships[0]?.id,
        link: eventId
          ? "event"
          : accommodationId
            ? "accommodation"
            : flightId
              ? "flight"
              : "none",
        eventId,
        accommodationId,
        flightId,
        splitType: expense?.splitType ?? "even_all",
        participantIds: expense?.shares.map((s) => s.userId) ?? [],
      },
    });

  const link = watch("link");
  const splitType = watch("splitType");
  const participantIds = watch("participantIds") ?? [];
  const isLoading = isAdding || isUpdating || isDeleting;
  const canDelete =
    !!expense && canChangeExpense(trip.role, userId, expense);

  const members = trip.userMemberships;
  const accommodations = accommodationData?.data ?? [];
  const flights = flightData?.data ?? [];

  const toggleParticipant = (id: number) => {
    setValue(
      "participantIds",
      participantIds.includes(id)
        ? participantIds.filter((p) => p !== id)
        : [...participantIds, id],
      { shouldValidate: true },
    );
  };

  const onSubmit = async ({ link: linkType, ...values }: ExpenseFormValues) => {
    const body = {
      ...values,
      description: values.description.trim(),
      eventId: linkType === "event" ? values.eventId : null,
      accommodationId:
        linkType === "accommodation" ? values.accommodationId : null,
      flightId: linkType === "flight" ? values.flightId : null,
      participantIds:
        values.splitType === "selected" ? values.participantIds : undefined,
    };
    try {
      if (expense) {
        await updateExpense({
          tripId: trip.id,
          expenseId: expense.id,
          expense: body,
        }).unwrap();
        toast.success("Expense updated.");
      } else {
        await addExpense({ tripId: trip.id, expense: body }).unwrap();
        toast.success("Expense added.");
      }
      onSuccess();
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not save the expense.",
      );
    }
  };

  const handleDelete = async () => {
    if (expense && (await remove(expense.id))) onSuccess();
  };

  return (
    <form className="form p-1" onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Description"
        placeholder="e.g. Dinner at the harbour"
        {...register("description")}
        errorMessage={formState.errors.description?.message}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Amount (£)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          {...register("amount")}
          errorMessage={formState.errors.amount?.message}
        />
        <FormInput
          label="Date"
          type="date"
          {...register("spentOn")}
          errorMessage={formState.errors.spentOn?.message}
        />
        <FormSelect
          label="Category"
          {...register("category")}
          value={watch("category")}
          options={expenseCategories.map((c) => ({
            name: capitalise(c),
            value: c,
          }))}
        />
        <FormSelect
          label="Paid by"
          {...register("paidById")}
          value={watch("paidById")}
          options={payerOptions(
            members,
            trip.role,
            userId,
            expense?.paidById,
          ).map((m) => ({
            name: m.username,
            value: String(m.id),
          }))}
        />
        <FormSelect
          label="Link to"
          {...register("link")}
          value={link}
          options={linkOptions}
        />
        {link === "event" && (
          <FormSelect
            label="Event"
            errorMessage={formState.errors.eventId?.message}
            {...register("eventId")}
            value={watch("eventId") ?? ""}
            options={[
              { name: "Choose an event", value: "" },
              ...events.map((e) => ({
                name: e.name,
                value: String(e.id),
              })),
            ]}
          />
        )}
        {link === "accommodation" && (
          <FormSelect
            label="Accommodation"
            errorMessage={formState.errors.accommodationId?.message}
            {...register("accommodationId")}
            value={watch("accommodationId") ?? ""}
            options={[
              { name: "Choose an accommodation", value: "" },
              ...accommodations.map((a) => ({
                name: a.name,
                value: String(a.id),
              })),
            ]}
          />
        )}
        {link === "flight" && (
          <FormSelect
            label="Flight"
            errorMessage={formState.errors.flightId?.message}
            {...register("flightId")}
            value={watch("flightId") ?? ""}
            options={[
              { name: "Choose a flight", value: "" },
              ...flights.map((f) => ({
                name: `${f.airline}${f.flightNumber} · ${f.departureAirport} → ${f.arrivalAirport}`,
                value: String(f.id),
              })),
            ]}
          />
        )}
      </div>

      <FormSelect
        label="How to split"
        {...register("splitType")}
        value={splitType}
        options={splitOptions}
      />
      {splitType === "selected" && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="text-xs text-text-secondary pb-1">
            Split between
          </legend>
          {members.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer ${
                participantIds.includes(m.id)
                  ? "bg-brand-primary/15 border-brand-primary text-brand-primary"
                  : "bg-surface-muted border-surface-border text-text-secondary"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={participantIds.includes(m.id)}
                onChange={() => toggleParticipant(m.id)}
              />
              {m.username}
            </label>
          ))}
          {formState.errors.participantIds?.message && (
            <p className="w-full text-xs text-error">
              {formState.errors.participantIds.message}
            </p>
          )}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {canDelete && !confirmingDelete && (
          <button
            type="button"
            className="btn-secondary px-4 py-2 rounded-xl mr-auto text-error"
            onClick={() => setConfirmingDelete(true)}
            disabled={isLoading}
          >
            Delete
          </button>
        )}
        {canDelete && confirmingDelete && (
          <div className="mr-auto flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              Delete this expense?
            </span>
            <button
              type="button"
              className="btn-error px-4 py-2 rounded-xl"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2 rounded-xl"
              onClick={() => setConfirmingDelete(false)}
              disabled={isLoading}
            >
              Keep
            </button>
          </div>
        )}
        <button
          type="button"
          className="btn-secondary px-4 py-2 rounded-xl"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary px-4 py-2 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : expense ? "Save expense" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
