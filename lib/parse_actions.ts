import { config } from "./config.ts";
import { asAhxCSSPropertyName, getAhxCSSPropertyNames } from "./util/names.ts";
import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { resolveElement } from "./util/resolve_element.ts";
import type { ActionSpec, ControlDecl } from "./types.ts";

export function parseActions(control: ControlDecl): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const [url] = parseAttrOrCssValue(method, control);
    if (url) {
      const baseURL = (resolveElement(control) ?? document).baseURI;

      actionSpecs.push({
        type: "request",
        method,
        url: new URL(url, baseURL),
      });
    }
  }

  if (control instanceof CSSStyleRule) {
    if (getAhxCSSPropertyNames(control).has(asAhxCSSPropertyName("harvest"))) {
      actionSpecs.push({
        type: "harvest",
      });
    }
  }

  return actionSpecs;
}
