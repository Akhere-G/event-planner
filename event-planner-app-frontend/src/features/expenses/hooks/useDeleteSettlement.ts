import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { useDeleteSettlementMutation } from "../services/expenseApiSlice";

/** Deletes a payment and tells the user how it went. Resolves to whether it worked. */
export default function useDeleteSettlement(tripId: number) {
  const [deleteSettlement, { isLoading }] = useDeleteSettlementMutation();

  const remove = async (settlementId: number) => {
    try {
      await deleteSettlement({ tripId, settlementId }).unwrap();
      toast.success("Payment deleted.");
      return true;
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not delete the payment.",
      );
      return false;
    }
  };

  return { remove, isDeleting: isLoading };
}
