import { useForm } from "react-hook-form";
import { FormInput } from "../../../components";
import { yupResolver } from "@hookform/resolvers/yup";
import { packingItemSchema, type PackingitemSchema } from "../schema";
import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { Plus } from "lucide-react";

const PRESET_CATEGORIES = [
  "Clothing",
  "Toiletries",
  "Electronics",
  "Documents",
  "Specialty Gear",
  "Misc",
];

export default function PackingItemForm({
  submitAction,
  isShared = false,
  actionText = "Add",
  isLoading,
  onCancel,
}: {
  isShared?: boolean;
  submitAction: (packingItem: PackingitemSchema) => Promise<void>;
  actionText?: string;
  isLoading: boolean;
  onCancel?: () => void;
}) {
  const { register, formState, handleSubmit, setValue, watch } =
    useForm<PackingitemSchema>({
      resolver: yupResolver(packingItemSchema),
      defaultValues: {
        category: "Clothing",
        isShared,
        name: "",
      },
    });

  const selectedCategory = watch("category");

  const onSubmit = async (data: PackingitemSchema) => {
    try {
      await submitAction({
        name: data.name.trim(),
        category: data.category.trim(),
        isShared: data.isShared ?? isShared,
      });
      setValue("name", "");
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to save item");
      }
    }
  };

  return (
    <form
      className="card flex flex-col gap-3 p-4 bg-surface rounded-xl border border-surface-border"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end">
        <FormInput
          label="Item Name"
          placeholder="e.g. Swimming Suit, Passport, Power Bank"
          {...register("name")}
          errorMessage={formState.errors.name?.message}
          formClassNames="flex-1 min-w-30"
        />

        <div className="flex-0.5 flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary">
            Category
          </label>
          <FormInput
            placeholder="Category"
            {...register("category")}
            errorMessage={formState.errors.category?.message}
            formClassNames="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-1.5 h-10 px-4 text-sm"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            <span>{isLoading ? "Saving..." : actionText}</span>
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary h-10 px-4 text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
        <span className="font-medium mr-1">Quick categories:</span>
        {PRESET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setValue("category", cat)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? "bg-brand-primary/15 border-brand-primary text-brand-primary font-medium"
                : "bg-surface-muted border-surface-border hover:bg-surface-border text-text-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </form>
  );
}
