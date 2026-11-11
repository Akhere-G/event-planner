import * as yup from "yup";
import { CURRENCY_CODES } from "../currency/constants";
import { expenseCategories, splitTypes } from "./types";

export const expenseSchema = yup.object({
  description: yup.string().trim().required("Description is required."),
  amount: yup
    .number()
    .typeError("Enter an amount.")
    .moreThan(0, "Amount must be greater than zero.")
    .required("Amount is required."),
  currency: yup
    .string()
    .oneOf(CURRENCY_CODES, "Choose a supported currency.")
    .required("Choose a currency."),
  category: yup.string().oneOf(expenseCategories).required(),
  spentOn: yup.string().required("Date is required."),
  paidById: yup.number().required("Choose who paid."),
  link: yup
    .string()
    .oneOf(["none", "event", "accommodation", "flight"])
    .required(),
  eventId: yup
    .number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .default(null)
    .when("link", {
      is: "event",
      then: (schema) => schema.required("Choose one."),
    }),
  accommodationId: yup
    .number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .default(null)
    .when("link", {
      is: "accommodation",
      then: (schema) => schema.required("Choose one."),
    }),
  flightId: yup
    .number()
    .transform((value, original) => (original === "" ? null : value))
    .nullable()
    .default(null)
    .when("link", {
      is: "flight",
      then: (schema) => schema.required("Choose one."),
    }),
  splitType: yup.string().oneOf(splitTypes).required(),
  participantIds: yup
    .array()
    .of(yup.number().required())
    .default([])
    .when("splitType", {
      is: "selected",
      then: (schema) => schema.min(1, "Choose at least one person."),
    }),
});

export type ExpenseFormValues = yup.InferType<typeof expenseSchema>;

export const settlementSchema = yup.object({
  fromUserId: yup.number().required("Choose who paid."),
  toUserId: yup
    .number()
    .required("Choose who received it.")
    .notOneOf([yup.ref("fromUserId")], "Choose two different people."),
  amountGbp: yup
    .number()
    .typeError("Enter an amount.")
    .moreThan(0, "Amount must be greater than zero.")
    .required("Amount is required."),
  settledOn: yup.string().required("Date is required."),
});

export type SettlementFormValues = yup.InferType<typeof settlementSchema>;

export const budgetSchema = yup.object({
  budgetAmountGbp: yup
    .number()
    .typeError("Enter an amount.")
    .min(0, "Budget cannot be negative.")
    .required("Enter an amount."),
});

export type BudgetFormValues = yup.InferType<typeof budgetSchema>;
