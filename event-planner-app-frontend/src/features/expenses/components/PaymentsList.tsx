import { useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useSelector } from "react-redux";
import { ConfirmModal, StateGate } from "../../../components";
import type { RootState } from "../../../store";
import type { Trip } from "../../trips/types";
import useDeleteSettlement from "../hooks/useDeleteSettlement";
import { useGetSettlementsQuery } from "../services/expenseApiSlice";
import type { Settlement } from "../types";
import { canChangeSettlement, formatGbp } from "../utils";

export default function PaymentsList({ trip }: { trip: Trip }) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data, isLoading, isError } = useGetSettlementsQuery(trip.id);
  const { remove } = useDeleteSettlement(trip.id);
  const [deleting, setDeleting] = useState<Settlement | null>(null);
  const payments = data?.data ?? [];

  const handleDelete = async () => {
    if (deleting && (await remove(deleting.id))) setDeleting(null);
  };

  return (
    <div className="border-t border-surface-border pt-3 flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-text-secondary">Payments</h4>
      <StateGate
        loadingStateProps={{ isLoading }}
        errorStateProps={{ isError }}
        emptyStateProps={{
          isEmpty: payments.length === 0,
          message: "No payments recorded yet.",
        }}
      >
        <ul className="flex flex-col gap-2">
          {payments.map((payment) => {
            const from = payment.fromUser?.username ?? "Someone";
            const to = payment.toUser?.username ?? "someone";
            return (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-text-primary">
                    {from} <ArrowRight size={14} /> {to}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {format(parseISO(payment.settledOn), "d MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold">
                    {formatGbp(payment.amountGbp)}
                  </span>
                  {canChangeSettlement(trip.role, userId, payment) && (
                    <button
                      type="button"
                      aria-label={`Delete payment from ${from} to ${to}`}
                      className="p-1 rounded hover:bg-surface-muted text-error"
                      onClick={() => setDeleting(payment)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </StateGate>
      {deleting && (
        <ConfirmModal
          open
          onOpenChange={(open) => !open && setDeleting(null)}
          title={`Delete the ${formatGbp(deleting.amountGbp)} payment`}
          confirmAction={handleDelete}
        />
      )}
    </div>
  );
}
