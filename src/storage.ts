import type { InputMode, MethodId, Strength } from "./calculator";

export interface Preferences { method: MethodId; mode: InputMode; strength: Strength }
const KEY = "first-pour-preferences-v1";

export function loadPreferences(): { value: Preferences | null; error?: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { value: null };
    const value: unknown = JSON.parse(raw);
    if (!isPreferences(value)) {
      localStorage.removeItem(KEY);
      return { value: null, error: "Saved settings were damaged, so we safely reset them." };
    }
    return { value };
  } catch {
    return { value: null, error: "Saved settings are unavailable. Your calculator still works, but changes may not persist." };
  }
}

export function savePreferences(value: Preferences): string | null {
  try { localStorage.setItem(KEY, JSON.stringify(value)); return null; }
  catch { return "We couldn’t save these settings. Keep this tab open to preserve your recipe."; }
}

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["pour", "french", "aeropress", "drip"].includes(String(item.method)) &&
    ["cups", "coffee"].includes(String(item.mode)) && [0, 1, 2].includes(Number(item.strength));
}
