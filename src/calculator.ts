export type MethodId = "pour" | "french" | "aeropress" | "drip";
export type InputMode = "cups" | "coffee";
export type Strength = 0 | 1 | 2;

export interface BrewMethod { id: MethodId; name: string; ratio: number; note: string }
export interface RecipeInput { method: MethodId; mode: InputMode; quantity: number; strength: Strength }
export interface Recipe { coffeeG: number; waterMl: number; coffeeTbsp: number; waterOz: number; cups: number; ratio: number }

export const METHODS: readonly BrewMethod[] = [
  { id: "pour", name: "Pour Over", ratio: 15, note: "Bloom with twice the coffee weight in water for 30–45 seconds." },
  { id: "french", name: "French Press", ratio: 12, note: "Steep for four minutes, then press slowly and pour right away." },
  { id: "aeropress", name: "AeroPress", ratio: 14, note: "Stir for 10 seconds, steep briefly, then press with gentle pressure." },
  { id: "drip", name: "Drip Machine", ratio: 17, note: "Rinse the filter first and level the grounds for even extraction." }
] as const;

export const ML_PER_CUP = 240;
export const MIN_QUANTITY = 0.1;
const ML_PER_FL_OZ = 29.5735;
const GRAMS_PER_TBSP = 5;

export function getMethod(id: MethodId): BrewMethod {
  const method = METHODS.find(item => item.id === id);
  if (!method) throw new Error(`Unknown brew method: ${id}`);
  return method;
}

export function adjustedRatio(base: number, strength: Strength): number {
  return base + (1 - strength) * 2;
}

export function calculateRecipe(input: RecipeInput): Recipe {
  if (!Number.isFinite(input.quantity) || input.quantity < MIN_QUANTITY) throw new RangeError("Quantity must be at least 0.1.");
  const ratio = adjustedRatio(getMethod(input.method).ratio, input.strength);
  const coffeeG = input.mode === "cups" ? input.quantity * ML_PER_CUP / ratio : input.quantity;
  const waterMl = input.mode === "cups" ? input.quantity * ML_PER_CUP : input.quantity * ratio;
  return { coffeeG, waterMl, ratio, coffeeTbsp: coffeeG / GRAMS_PER_TBSP, waterOz: waterMl / ML_PER_FL_OZ, cups: waterMl / ML_PER_CUP };
}

export function format(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}
