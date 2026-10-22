import { describe, expect, it } from "vitest";
import { isApiError, isFetchBaseQueryError, isValidationError } from "../utils";

describe("isApiError", () => {
  it("accepts an object with a string data.message", () => {
    expect(isApiError({ data: { message: "Something went wrong." } })).toBe(true);
  });

  it("rejects when data.message is missing", () => {
    expect(isApiError({ data: {} })).toBe(false);
  });

  it("rejects when data.message is not a string", () => {
    expect(isApiError({ data: { message: 123 } })).toBe(false);
  });

  it("rejects null, undefined, and non-objects", () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError("error")).toBe(false);
  });
});

describe("isFetchBaseQueryError", () => {
  it("accepts any object with a data key", () => {
    expect(isFetchBaseQueryError({ data: null })).toBe(true);
  });

  it("rejects an object without a data key", () => {
    expect(isFetchBaseQueryError({ message: "oops" })).toBe(false);
  });
});

describe("isValidationError", () => {
  it("accepts an object with data.error", () => {
    expect(isValidationError({ data: { error: "Invalid field." } })).toBe(true);
  });

  it("rejects an object with data but no error key", () => {
    expect(isValidationError({ data: { message: "oops" } })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isValidationError(null)).toBe(false);
    expect(isValidationError("error")).toBe(false);
  });
});
