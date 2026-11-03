import { describe, expect, it } from "vitest";
import { homeCurrencySchema } from "../schema";
import { expenseSchema } from "../../expenses/schema";

const expense = {
  description: "Dinner",
  amount: 30,
  currency: "EUR",
  category: "food",
  spentOn: "2026-08-01",
  paidById: 1,
  link: "none",
  splitType: "even_all",
};

describe("currency forms", () => {
  it("accepts a supported home currency", async () => {
    await expect(
      homeCurrencySchema.validate({ homeCurrency: "EUR" }),
    ).resolves.toBeTruthy();
  });

  it.each(["", "XXX", "eur"])("rejects home currency %j", async (value) => {
    await expect(
      homeCurrencySchema.validate({ homeCurrency: value }),
    ).rejects.toBeTruthy();
  });

  it("accepts an expense in a foreign currency", async () => {
    await expect(expenseSchema.validate(expense)).resolves.toMatchObject({
      currency: "EUR",
    });
  });

  it("rejects an expense in an unsupported currency", async () => {
    await expect(
      expenseSchema.validate({ ...expense, currency: "XXX" }),
    ).rejects.toThrow("Choose a supported currency.");
  });

  it("requires a currency on an expense", async () => {
    await expect(
      expenseSchema.validate({ ...expense, currency: undefined }),
    ).rejects.toThrow("Choose a currency.");
  });
});
