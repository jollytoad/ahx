import { config } from "./config.ts";
import type { ActionSpec } from "./types.ts";

export function parseActions(elt: Element): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const attr = `${config.prefix}-${method}`;
    if (elt.hasAttribute(attr)) {
      actionSpecs.push({
        type: "request",
        method,
        url: elt.getAttribute(attr) ?? "",
      });
    }
  }

  return actionSpecs;
}
