import { METHODS, MIN_QUANTITY, adjustedRatio, calculateRecipe, format, getMethod, type InputMode, type MethodId, type Strength } from "./calculator";
import { loadPreferences, savePreferences, type Preferences } from "./storage";

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required element missing: ${selector}`);
  return element;
};

const elements = {
  form: $("#calculator"),
  methods: $("#methods"), quantity: $<HTMLInputElement>("#quantity"), quantityLabel: $("#quantity-label"), unit: $("#unit"),
  inputError: $("#input-error"), strength: $<HTMLInputElement>("#strength"), strengthOutput: $<HTMLOutputElement>("#strength-output"),
  ratioPreview: $("#ratio-preview"), methodBadge: $("#method-badge"), coffeeG: $("#coffee-g"), waterMl: $("#water-ml"),
  coffeeTbsp: $("#coffee-tbsp"), waterOz: $("#water-oz"), yieldCups: $("#yield-cups"), noteTitle: $("#note-title"),
  note: $("#note"), message: $("#system-message"), results: $("#results")
};

const loaded = loadPreferences();
let state: Preferences = loaded.value ?? { method: "pour", mode: "cups", strength: 1 };
let startupMessage = loaded.error;

function showMessage(message?: string): void {
  elements.message.hidden = !message;
  elements.message.textContent = message ?? "";
}

function renderMethods(): void {
  elements.methods.replaceChildren(...METHODS.map(method => {
    const button = document.createElement("button");
    button.type = "button"; button.dataset.method = method.id;
    button.setAttribute("aria-pressed", String(method.id === state.method));
    button.innerHTML = `<span>${String(METHODS.indexOf(method) + 1).padStart(2, "0")}</span>${method.name}`;
    return button;
  }));
}

function render(): void {
  const quantity = elements.quantity.valueAsNumber;
  const valid = Number.isFinite(quantity) && quantity >= MIN_QUANTITY && quantity <= 1000;
  elements.inputError.textContent = valid ? "" : "Enter an amount between 0.1 and 1,000.";
  elements.quantity.setAttribute("aria-invalid", String(!valid));
  const method = getMethod(state.method);
  const labels = ["Mild", "Medium", "Strong"];
  elements.strengthOutput.value = labels[state.strength];
  elements.quantityLabel.textContent = state.mode === "cups" ? "Number of cups" : "Coffee available";
  elements.unit.textContent = state.mode === "cups" ? "cups" : "grams";
  elements.methodBadge.textContent = method.name.toUpperCase();
  elements.noteTitle.textContent = `${method.name} tip`;
  elements.note.textContent = method.note;
  document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(button =>
    button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode))
  );
  const ratio = adjustedRatio(method.ratio, state.strength);
  elements.ratioPreview.textContent = `1 : ${ratio}`;
  if (!valid) return;
  const result = calculateRecipe({ ...state, quantity });
  elements.coffeeG.textContent = format(result.coffeeG);
  elements.waterMl.textContent = format(result.waterMl, 0);
  elements.coffeeTbsp.textContent = `${format(result.coffeeTbsp)} tbsp`;
  elements.waterOz.textContent = `${format(result.waterOz)} fl oz`;
  elements.yieldCups.textContent = `${format(result.cups)} ${Math.abs(result.cups - 1) < .05 ? "cup" : "cups"}`;
  elements.results.classList.remove("updated");
  requestAnimationFrame(() => elements.results.classList.add("updated"));
}

function commit(next: Partial<Preferences>): void {
  state = { ...state, ...next };
  const storageError = savePreferences(state);
  if (!storageError) startupMessage = undefined;
  showMessage(storageError ?? startupMessage);
  renderMethods(); render();
}

elements.methods.addEventListener("click", event => {
  const id = (event.target as HTMLElement).closest<HTMLButtonElement>("button")?.dataset.method;
  if (METHODS.some(method => method.id === id)) commit({ method: id as MethodId });
  else if (id) showMessage("That brew method is not available.");
});
document.querySelector(".segmented")?.addEventListener("click", event => {
  const mode = (event.target as HTMLElement).closest<HTMLButtonElement>("button")?.dataset.mode;
  if (mode === "cups" || mode === "coffee") commit({ mode: mode as InputMode });
});
elements.quantity.addEventListener("input", render);
elements.form.addEventListener("submit", event => event.preventDefault());
elements.strength.addEventListener("input", () => commit({ strength: Number(elements.strength.value) as Strength }));
elements.strength.value = String(state.strength);
showMessage(startupMessage); renderMethods(); render();
