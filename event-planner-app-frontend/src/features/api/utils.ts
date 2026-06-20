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

export interface ApiError {
  data: { message: string };
}
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  );
}
