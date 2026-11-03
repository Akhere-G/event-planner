import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { FormInput, FormSelect } from "../../../components";
import type { RootState } from "../../../store";
import { isApiError } from "../../api/utils";
import { useGetAccommodationsQuery } from "../../accommodations/accomodationApiSlice";
import { currencyOptions } from "../../currency/constants";
import { formatMoney } from "../../currency/utils";
import useMoney from "../../currency/useMoney";
import type { Trip } from "../../trips/types";
import { expenseSchema, type ExpenseFormValues } from "../schema";
import {
  useAddExpenseMutation,
  useUpdateExpenseMutation,
} from "../services/expenseApiSlice";
import { expenseCategories, type Expense, type ExpensePrefill } from "../types";

const splitOptions = [
  { name: "Split evenly between everyone", value: "even_all" },
  { name: "Split between selected people", value: "selected" },
  { name: "Only for the payer", value: "self" },
];

const linkOptions = [
  { name: "Not linked", value: "none" },
  { name: "An event", value: "event" },
  { name: "An accommodation", value: "accommodation" },
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
  const money = useMoney();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data: accommodationData } = useGetAccommodationsQuery(trip.id);
  const [addExpense, { isLoading: isAdding }] = useAddExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const eventId = expense?.eventId ?? prefill?.eventId ?? null;
  const accommodationId =
    expense?.accommodationId ?? prefill?.accommodationId ?? null;

  const { register, handleSubmit, watch, setValue, formState } =
    useForm<ExpenseFormValues>({
      resolver: yupResolver(expenseSchema),
      defaultValues: {
        description: expense?.description ?? prefill?.description ?? "",
        amount: expense?.amount,
        currency: expense?.currency ?? money.homeCurrency,
        category: expense?.category ?? prefill?.category ?? "other",
        spentOn:
          expense?.spentOn ??
          prefill?.spentOn ??
          format(new Date(), "yyyy-MM-dd"),
        paidById: expense?.paidById ?? userId ?? trip.userMemberships[0]?.id,
        link: eventId ? "event" : accommodationId ? "accommodation" : "none",
        eventId,
        accommodationId,
        splitType: expense?.splitType ?? "even_all",
        participantIds: expense?.shares.map((s) => s.userId) ?? [],
      },
    });

  const link = watch("link");
  const currency = watch("currency");
  const amount = Number(watch("amount"));
  const estimateGbp =
    currency !== "GBP" && amount > 0
      ? money.estimateGbp(amount, currency)
      : null;
  const splitType = watch("splitType");
  const participantIds = watch("participantIds") ?? [];
  const isLoading = isAdding || isUpdating;

  const members = trip.userMemberships;
  const accommodations = accommodationData?.data ?? [];

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

  return (
    <form className="form p-1" onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Description"
        placeholder="e.g. Dinner at the harbour"
        {...register("description")}
        errorMessage={formState.errors.description?.message}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormSelect
          label="Currency"
          {...register("currency")}
          value={currency}
          options={currencyOptions}
          errorMessage={formState.errors.currency?.message}
        />
        <FormInput
          label={`Amount (${currency})`}
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
        {currency !== "GBP" && (
          <p
            className="sm:col-span-2 text-sm text-text-secondary"
            role="status"
          >
            {estimateGbp !== null
              ? `≈ ${formatMoney(estimateGbp, "GBP")} at today's rate. The final amount uses the rate on the expense date.`
              : "Enter an amount to see it in pounds. Splits are calculated in GBP."}
          </p>
        )}
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
          options={members.map((m) => ({
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
              ...trip.events.map((e) => ({
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

      <div className="flex justify-end gap-2">
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
