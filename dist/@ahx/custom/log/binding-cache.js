
import { allowBindings, denyBindings } from "@ahx/custom/filter-list.js";
import { PREFIX } from "@ahx/custom/log/config.js";
import { bindingOutcome as log } from "./binding.js";

export const STORAGE_KEY = "ahx-deny-bindings";

allowBindings.clear();
denyBindings.clear();

try {
  const bindings = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
  if (Array.isArray(bindings)) {
    for (const value of bindings) {
      if (typeof value === "string") {
        denyBindings.add(value);
      }
    }
  }
  console.debug(
    `${PREFIX}load deny bindings`,
    JSON.stringify([...denyBindings]),
  );
} catch {
  // ignore
}

let handle;

export function bindingOutcome(
  outcome,
  _sep,
) {
  log(outcome, _sep);

  if (outcome.status === "notFound") {
    const kind = outcome.feature.kind ?? "unknown";
    const binding = outcome.moduleBinding?.join(" ");

    if (binding) {
      denyBindings.add(`${kind}:${binding}`);

      clearTimeout(handle);
      handle = setTimeout(() => {
        const json = JSON.stringify([...denyBindings]);
        console.debug(`${PREFIX}save deny bindings`, json);
        sessionStorage.setItem(STORAGE_KEY, json);
      }, 100);
    }
  }
}

export function clearBindingsCache() {
  sessionStorage.removeItem(STORAGE_KEY);
}
