import { afterEach, describe, expect, it } from "vitest";
import { loadPreferences, savePreferences } from "../src/storage";

const memory = new Map<string, string>();
const fakeStorage: Storage = {
  get length() { return memory.size; },
  clear: () => memory.clear(),
  getItem: key => memory.get(key) ?? null,
  key: index => [...memory.keys()][index] ?? null,
  removeItem: key => { memory.delete(key); },
  setItem: (key, value) => { memory.set(key, value); }
};

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: fakeStorage });

describe("preference persistence", () => {
  afterEach(() => memory.clear());

  it("round-trips a valid preference shape", () => {
    const value = { method: "french" as const, mode: "coffee" as const, strength: 2 as const };
    expect(savePreferences(value)).toBeNull();
    expect(loadPreferences()).toEqual({ value });
  });

  it("recovers from readable corrupt data with a visible error", () => {
    memory.set("first-pour-preferences-v1", JSON.stringify({ method: "unknown" }));
    expect(loadPreferences()).toEqual({ value: null, error: "Saved settings were damaged, so we safely reset them." });
    expect(memory.size).toBe(0);
  });
});
