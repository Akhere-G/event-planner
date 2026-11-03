import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { FormSelect, StateGate } from "../../../components";
import { isApiError } from "../../api/utils";
import { useCheckUserQuery } from "../../auth/services/authApiSlice";
import { currencyOptions, DEFAULT_CURRENCY } from "../constants";
import { homeCurrencySchema, type HomeCurrencyFormValues } from "../schema";
import { useUpdateHomeCurrencyMutation } from "../services/currencyApiSlice";

export default function CurrencyCard() {
  const { data, isLoading, isError } = useCheckUserQuery();
  const [updateHomeCurrency, { isLoading: isSaving }] =
    useUpdateHomeCurrencyMutation();
  const current = data?.data?.homeCurrency ?? DEFAULT_CURRENCY;

  const { register, handleSubmit, watch, formState } =
    useForm<HomeCurrencyFormValues>({
      resolver: yupResolver(homeCurrencySchema),
      values: { homeCurrency: current },
    });

  const onSubmit = async ({ homeCurrency }: HomeCurrencyFormValues) => {
    try {
      await updateHomeCurrency(homeCurrency).unwrap();
      toast.success(`Home currency set to ${homeCurrency}.`);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.data.message : "Could not save your currency.",
      );
    }
  };

  return (
    <StateGate loadingStateProps={{ isLoading }} errorStateProps={{ isError }}>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-sm text-text-secondary">
          Trip totals are shown in this currency, alongside pounds. Expenses are
          always split and settled in GBP.
        </p>
        <FormSelect
          label="Home currency"
          {...register("homeCurrency")}
          value={watch("homeCurrency")}
          options={currencyOptions}
          errorMessage={formState.errors.homeCurrency?.message}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded-xl"
            disabled={isSaving || watch("homeCurrency") === current}
          >
            {isSaving ? "Saving..." : "Save currency"}
          </button>
        </div>
      </form>
    </StateGate>
  );
}
