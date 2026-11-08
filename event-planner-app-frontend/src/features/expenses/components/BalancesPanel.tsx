import { useState } from "react";
import { ArrowRight, HandCoins } from "lucide-react";
import { useSelector } from "react-redux";
import { StateGate } from "../../../components";
import type { RootState } from "../../../store";
import type { Trip } from "../../trips/types";
import { canUserEdit, isAdmin } from "../../users/utils";
import { useGetBalancesQuery } from "../services/expenseApiSlice";
import type { Transfer } from "../types";
import { formatGbp } from "../utils";
import PaymentsList from "./PaymentsList";
import SettlementModal from "./SettlementModal";

export default function BalancesPanel({ trip }: { trip: Trip }) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data, isLoading, isError } = useGetBalancesQuery(trip.id);
  const [settling, setSettling] = useState<{ suggestion?: Transfer } | null>(
    null,
  );

  const balances = data?.data;
  const canMarkPaid = (t: Transfer) =>
    canUserEdit(trip.role) && (isAdmin(trip.role) || t.fromUserId === userId);
  const nameOf = (id: number) =>
    balances?.balances.find((b) => b.userId === id)?.username ?? "Unknown";

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-text-primary">Balances</h3>
        {canUserEdit(trip.role) && (
          <button
            type="button"
            className="btn-secondary flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
            onClick={() => setSettling({})}
          >
            <HandCoins size={16} />
            Record payment
          </button>
        )}
      </div>
      <StateGate
        loadingStateProps={{ isLoading }}
        errorStateProps={{ isError }}
        emptyStateProps={{
          isEmpty: !!balances && balances.totalSpentGbp === 0,
          message: "No expenses yet, so nobody owes anything.",
        }}
      >
        <ul className="flex flex-col gap-1">
          {balances?.balances.map((b) => (
            <li key={b.userId} className="flex justify-between text-sm">
              <span className="text-text-primary">{b.username}</span>
              <span
                className={
                  b.netGbp > 0
                    ? "text-success font-semibold"
                    : b.netGbp < 0
                      ? "text-error font-semibold"
                      : "text-text-secondary"
                }
              >
                {b.netGbp > 0
                  ? "is owed "
                  : b.netGbp < 0
                    ? "owes "
                    : "settled "}
                {b.netGbp !== 0 && formatGbp(Math.abs(b.netGbp))}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-surface-border pt-3 flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-text-secondary">
            Suggested payments
          </h4>
          {balances?.transfers.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Everyone is settled up.
            </p>
          ) : (
            balances?.transfers.map((t) => (
              <div
                key={`${t.fromUserId}-${t.toUserId}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  {nameOf(t.fromUserId)} <ArrowRight size={14} />{" "}
                  {nameOf(t.toUserId)}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">
                    {formatGbp(t.amountGbp)}
                  </span>
                  {canMarkPaid(t) && (
                    <button
                      type="button"
                      className="text-brand-primary hover:underline"
                      onClick={() => setSettling({ suggestion: t })}
                    >
                      Mark paid
                    </button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </StateGate>
      <PaymentsList trip={trip} />
      {settling && (
        <SettlementModal
          open
          onOpenChange={(open) => !open && setSettling(null)}
          trip={trip}
          suggestion={settling.suggestion}
        />
      )}
    </div>
  );
}
