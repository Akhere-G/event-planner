import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { ConfirmModal, FormInput, FormSelect } from "../../../components";
import type { RootState } from "../../../store";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import { settlementSchema, type SettlementFormValues } from "../schema";
import { useAddSettlementMutation } from "../services/expenseApiSlice";
import type { Transfer } from "../types";
import { payerOptions } from "../utils";
import { useGetUsersQuery } from "../../users/usersApiSlice";
import type { User } from "../../users/types";

export default function SettlementModal({
  open,
  onOpenChange,
  trip,
  suggestion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip;
  suggestion?: Transfer;
}) {
  const [addSettlement, { isLoading }] = useAddSettlementMutation();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data } = useGetUsersQuery(trip.id);
  const members: User[] | undefined = data?.data.users;

  const fromUserId = suggestion?.fromUserId ?? userId ?? members?.[0]?.id;

  const { register, handleSubmit, watch, formState } =
    useForm<SettlementFormValues>({
      resolver: yupResolver(settlementSchema),
      defaultValues: {
        fromUserId,
        toUserId:
          suggestion?.toUserId ??
          members?.find((m) => m.id !== fromUserId)?.id ??
          members?.[0]?.id,
        amountGbp: suggestion?.amountGbp,
        settledOn: format(new Date(), "yyyy-MM-dd"),
      },
    });

  const toOption = (m: User) => ({
    name: m.username,
    value: String(m.id),
  });

  const onSubmit = async (settlement: SettlementFormValues) => {
    try {
      await addSettlement({ tripId: trip.id, settlement }).unwrap();
      toast.success("Payment recorded.");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not record the payment.",
      );
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Record payment"
      hideButtons
    >
      <form className="form p-1" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Who paid"
            {...register("fromUserId")}
            value={watch("fromUserId")}
            options={payerOptions(
              members ?? [],
              trip.role,
              userId,
              fromUserId,
            ).map(toOption)}
          />
          <FormSelect
            label="Who received it"
            {...register("toUserId")}
            value={watch("toUserId")}
            options={members?.map(toOption) ?? []}
            errorMessage={formState.errors.toUserId?.message}
          />
          <FormInput
            label="Amount (£)"
            type="number"
            step="0.01"
            min="0"
            {...register("amountGbp")}
            errorMessage={formState.errors.amountGbp?.message}
          />
          <FormInput
            label="Date"
            type="date"
            {...register("settledOn")}
            errorMessage={formState.errors.settledOn?.message}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary px-4 py-2 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Record payment"}
          </button>
        </div>
      </form>
    </ConfirmModal>
  );
}
