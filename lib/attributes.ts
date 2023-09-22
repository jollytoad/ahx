import { config } from "./config.ts";

export function hasAhxAttributes(elt: Element) {
  for (const attr of elt.attributes) {
    if (attr.name.startsWith(`${config.prefix}-`)) {
      return true;
    }
  }
}

let selector: string | undefined;

export function ahxSelector() {
  if (!selector) {
    selector = [...config.ahxAttrs, ...config.httpMethods].map((attr) =>
      `[${config.prefix}-${attr}]`
    ).join(",");
  }
  return selector;
}
