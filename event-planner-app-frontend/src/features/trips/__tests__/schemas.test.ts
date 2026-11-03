import { describe, expect, it } from "vitest";
import {
  budgetStepSchema,
  editPreferencesSchema,
  vibeStepSchema,
  whoStepSchema,
} from "../schemas/preferencesSchema";
import { stepSchemas } from "../schemas/tripFormSchemas";
import { tripSchema } from "../schemas/tripSchema";
import { autofillDefaultsFromPreferences } from "../preferenceUtils";

const basics = {
  name: "Paris 2026",
  destination: "Paris, France",
  latitude: 48.8,
  longitude: 2.3,
  startDate: "2026-08-01",
  endDate: "2026-08-08",
};

describe("step schemas", () => {
  it("basics step requires the trip fields and an end after the start", async () => {
    await expect(stepSchemas[0].validate(basics)).resolves.toBeTruthy();
    await expect(
      stepSchemas[0].validate({ ...basics, name: "" }),
    ).rejects.toThrow("Name is required.");
    await expect(
      stepSchemas[0].validate({ ...basics, endDate: "2026-08-01" }),
    ).rejects.toThrow("End date must be after start date.");
  });

  it("who step needs a trip type and a positive group size", async () => {
    await expect(
      whoStepSchema.validate({ tripType: "friends", groupSize: 4 }),
    ).resolves.toEqual({ tripType: "friends", groupSize: 4 });
    await expect(whoStepSchema.validate({ groupSize: 2 })).rejects.toThrow(
      "Choose who is going.",
    );
    await expect(
      whoStepSchema.validate({ tripType: "solo", groupSize: 0 }),
    ).rejects.toThrow("At least one person is going.");
    await expect(
      whoStepSchema.validate({ tripType: "alone", groupSize: 1 }),
    ).rejects.toThrow();
  });

  it("vibe step is optional and defaults to no vibes", async () => {
    const result = await vibeStepSchema.validate({});
    expect(result.vibes).toEqual([]);
    expect(result.pace).toBeNull();
    await expect(
      vibeStepSchema.validate({ pace: "frantic" }),
    ).rejects.toThrow();
  });

  it("budget step treats an empty total as none and rejects negatives", async () => {
    const empty = await budgetStepSchema.validate({
      budgetTier: "mid",
      budgetAmountGbp: "",
    });
    expect(empty.budgetAmountGbp).toBeNull();
    await expect(
      budgetStepSchema.validate({ budgetAmountGbp: -5 }),
    ).rejects.toThrow("Must be at least 0.");
  });

  it("the review step validates every part at once", async () => {
    const review = stepSchemas[4];
    await expect(review.validate({ ...basics, groupSize: 2 })).rejects.toThrow(
      "Choose who is going.",
    );
    await expect(
      review.validate({ ...basics, tripType: "couple", groupSize: 2 }),
    ).resolves.toBeTruthy();
  });

  it("trip basics accept an optional budget", async () => {
    const result = await tripSchema.validate({
      ...basics,
      budgetAmountGbp: "1200",
    });
    expect(result.budgetAmountGbp).toBe(1200);
  });

  it("edit preferences are all optional", async () => {
    await expect(editPreferencesSchema.validate({})).resolves.toBeTruthy();
  });
});

describe("autofillDefaultsFromPreferences", () => {
  it("maps saved preferences onto the autofill form", () => {
    expect(
      autofillDefaultsFromPreferences({
        tripType: "family",
        groupSize: 4,
        vibes: [],
        budgetTier: null,
        pace: "relaxed",
        interests: ["food"],
        transport: "walking",
      }),
    ).toEqual({
      pace: "relaxed",
      companions: "family_with_kids",
      transport: "walking",
      interests: ["food"],
    });
  });

  it("returns nothing when there are no preferences", () => {
    expect(autofillDefaultsFromPreferences(null)).toEqual({});
  });
});
