import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { useDeleteExpenseMutation } from "../services/expenseApiSlice";

/** Deletes an expense and tells the user how it went. Resolves to whether it worked. */
export default function useDeleteExpense(tripId: number) {
  const [deleteExpense, { isLoading }] = useDeleteExpenseMutation();

  const remove = async (expenseId: number) => {
    try {
      await deleteExpense({ tripId, expenseId }).unwrap();
      toast.success("Expense deleted.");
      return true;
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not delete the expense.",
      );
      return false;
    }
  };

  return { remove, isDeleting: isLoading };
}
