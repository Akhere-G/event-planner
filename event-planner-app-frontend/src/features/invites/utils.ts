import {
  Ban,
  CheckCircle2,
  CircleQuestionMark,
  Clock,
  X,
  XCircle,
} from "lucide-react";

export const getStatusConfig = (status: string, expiresAt: Date) => {
  if (status === "pending" && expiresAt < new Date()) {
    return {
      statusStyles: "bg-slate-100 text-slate-700 border-slate-200 opacity-75",
      Icon: X,
      status: "expired",
    };
  }
  switch (status) {
    case "pending":
      return {
        statusStyles: "bg-amber-100 text-amber-700 border-amber-200",
        Icon: Clock,
        status,
      };
    case "accepted":
      return {
        statusStyles: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Icon: CheckCircle2,
        status,
      };
    case "declined":
      return {
        statusStyles: "bg-rose-100 text-rose-700 border-rose-200",
        Icon: XCircle,
        status,
      };
    case "revoked":
      return {
        statusStyles: "bg-slate-100 text-slate-700 border-slate-200 opacity-75",
        Icon: Ban,
        status,
      };
    default:
      return {
        statusStyles: "bg-gray-100 text-gray-700 border-gray-200",
        Icon: CircleQuestionMark,
        status,
      };
  }
};
