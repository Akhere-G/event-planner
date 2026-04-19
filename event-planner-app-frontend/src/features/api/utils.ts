import type { ValidationError } from "./types";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function isValidationError(err: unknown): err is ValidationError {
  return (
    typeof err === "object" &&
    err !== null &&
    "data" in err &&
    typeof err.data === "object" &&
    err.data !== null &&
    "error" in err.data
  );
}

export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "data" in error;
}
