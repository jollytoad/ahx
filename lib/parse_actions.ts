import { config } from "./config.ts";
import { asAhxCSSPropertyName, getAhxCSSPropertyNames } from "./util/names.ts";
import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import type { ActionSpec, ControlDecl } from "./types.ts";

export function parseActions(control: ControlDecl): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const [url] = parseAttrOrCssValue(method, control);
    if (url) {
      actionSpecs.push({
        type: "request",
        method,
        url: parseURL(url, control),
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

function parseURL(url: string, control: ControlDecl): URL | undefined {
  const baseURL = control instanceof Element ? control.baseURI : undefined;
  try {
    return new URL(url, baseURL);
  } catch {
    return undefined;
  }
}
