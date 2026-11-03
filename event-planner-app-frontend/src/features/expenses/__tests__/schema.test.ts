import { describe, expect, it } from "vitest";
import { budgetSchema, expenseSchema, settlementSchema } from "../schema";

const valid = {
  description: "Dinner",
  amount: 30,
  currency: "GBP",
  category: "food",
  spentOn: "2026-08-01",
  paidById: 1,
  link: "none",
  splitType: "even_all",
};

describe("expenseSchema", () => {
  it("accepts a valid expense", async () => {
    await expect(expenseSchema.isValid(valid)).resolves.toBe(true);
  });

  it("rejects zero or negative amounts", async () => {
    await expect(expenseSchema.isValid({ ...valid, amount: 0 })).resolves.toBe(
      false,
    );
    await expect(expenseSchema.isValid({ ...valid, amount: -3 })).resolves.toBe(
      false,
    );
  });

  it("requires participants when splitting between selected people", async () => {
    const selected = { ...valid, splitType: "selected" };
    await expect(
      expenseSchema.isValid({ ...selected, participantIds: [] }),
    ).resolves.toBe(false);
    await expect(
      expenseSchema.isValid({ ...selected, participantIds: [1, 2] }),
    ).resolves.toBe(true);
  });

  it("requires an event when linked to one", async () => {
    await expect(
      expenseSchema.isValid({ ...valid, link: "event", eventId: "" }),
    ).resolves.toBe(false);
    await expect(
      expenseSchema.isValid({ ...valid, link: "event", eventId: 4 }),
    ).resolves.toBe(true);
  });
});

describe("settlementSchema", () => {
  const base = {
    fromUserId: 1,
    toUserId: 2,
    amountGbp: 5,
    settledOn: "2026-08-02",
  };

  it("accepts a valid settlement", async () => {
    await expect(settlementSchema.isValid(base)).resolves.toBe(true);
  });

  it("rejects paying yourself", async () => {
    await expect(
      settlementSchema.isValid({ ...base, toUserId: 1 }),
    ).resolves.toBe(false);
  });
});

describe("budgetSchema", () => {
  it("rejects a negative budget", async () => {
    await expect(budgetSchema.isValid({ budgetAmountGbp: -1 })).resolves.toBe(
      false,
    );
    await expect(budgetSchema.isValid({ budgetAmountGbp: 0 })).resolves.toBe(
      true,
    );
  });
});
