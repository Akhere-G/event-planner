import * as yup from "yup";
import { currencyCodes } from "./constants";

export const homeCurrencySchema = yup.object({
  homeCurrency: yup
    .string()
    .oneOf(currencyCodes, "Choose a supported currency.")
    .required("Choose a currency."),
});

export type HomeCurrencyFormValues = yup.InferType<typeof homeCurrencySchema>;
