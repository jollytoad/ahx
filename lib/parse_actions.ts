import { config } from "./config.ts";
import { asAhxCSSPropertyName, getAhxCSSPropertyNames } from "./util/names.ts";
import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { resolveElement } from "./util/resolve_element.ts";
import type { ActionSpec, TriggerOrigin } from "./types.ts";

export function parseActions(origin: TriggerOrigin): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const [url] = parseAttrOrCssValue(method, origin);
    if (url) {
      const baseURL = (resolveElement(origin) ?? document).baseURI;

      actionSpecs.push({
        type: "request",
        method,
        url: new URL(url, baseURL),
      });
    }
  }

  if (origin instanceof CSSStyleRule) {
    if (getAhxCSSPropertyNames(origin).has(asAhxCSSPropertyName("harvest"))) {
      actionSpecs.push({
        type: "harvest",
      });
    }
  }

  return actionSpecs;
}
