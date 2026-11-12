import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { CONNECT_RESULT_MESSAGES, parseConnectResult } from "../utils";

export const CONNECT_RESULT_PARAM = "calendar";

/** Reports the outcome Google's consent flow redirected back with, then clears it. */
export default function useConnectResultToast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const result = parseConnectResult(searchParams.get(CONNECT_RESULT_PARAM));

  useEffect(() => {
    if (!result) {
      return;
    }
    const show = result === "connected" ? toast.success : toast.error;
    show(CONNECT_RESULT_MESSAGES[result]);
    setSearchParams(
      (params) => {
        params.delete(CONNECT_RESULT_PARAM);
        return params;
      },
      { replace: true },
    );
  }, [result, setSearchParams]);
}
