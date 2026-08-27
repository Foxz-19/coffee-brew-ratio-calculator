import { describe, expect, it } from "vitest";
import { adjustedRatio, calculateRecipe, format } from "../src/calculator";

describe("coffee recipe calculations", () => {
  it("calculates pour over from cups", () => {
    expect(calculateRecipe({ method: "pour", mode: "cups", quantity: 2, strength: 1 })).toMatchObject({ coffeeG: 32, waterMl: 480, cups: 2, ratio: 15 });
  });
  it("calculates water from coffee on hand", () => {
    expect(calculateRecipe({ method: "french", mode: "coffee", quantity: 30, strength: 1 })).toMatchObject({ coffeeG: 30, waterMl: 360, ratio: 12 });
  });
  it("makes strong coffee use less water and loops no hidden state", () => {
    expect(adjustedRatio(15, 0)).toBe(17); expect(adjustedRatio(15, 2)).toBe(13);
  });
  it("rejects invalid quantities", () => {
    expect(() => calculateRecipe({ method: "drip", mode: "cups", quantity: 0, strength: 1 })).toThrow(RangeError);
    expect(() => calculateRecipe({ method: "drip", mode: "cups", quantity: 0.09, strength: 1 })).toThrow(RangeError);
  });
  it("formats compact readable values", () => expect(format(16.234)).toBe("16.2"));
});
