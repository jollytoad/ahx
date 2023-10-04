import { config } from "./config.ts";
import { parseAttrValue } from "./parse_attr_value.ts";
import { resolveElement } from "./resolve_element.ts";
import type { ActionSpec, TriggerOrigin } from "./types.ts";

export function parseActions(origin: TriggerOrigin): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const url = parseAttrValue(origin, method).value;
    if (url) {
      const baseURL = (resolveElement(origin) ?? document).baseURI;

      actionSpecs.push({
        type: "request",
        method,
        url: new URL(url, baseURL),
      });
    }
  }

  return actionSpecs;
}
