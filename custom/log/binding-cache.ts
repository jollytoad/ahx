import type { Feature, FeatureOutcome } from "@ahx/types";
import { allowBindings, denyBindings } from "@ahx/custom/filter-list.ts";
import { PREFIX } from "@ahx/custom/log/config.ts";
import { bindingOutcome as log } from "./binding.ts";

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

let handle: ReturnType<typeof setTimeout> | undefined;

export function bindingOutcome(
  outcome: FeatureOutcome<Feature, unknown>,
  _sep: string,
): void {
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
