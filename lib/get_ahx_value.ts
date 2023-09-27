import { asAhxAttributeName, asAhxCSSPropertyName } from "./names.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type { AhxName, TriggerOrigin } from "./types.ts";

export function getAhxValue(
  origin: TriggerOrigin,
  name: AhxName,
): string | undefined {
  if (origin instanceof Element) {
    const attrValue = origin.getAttribute(asAhxAttributeName(name));
    const { value, important } = parseCssValue({
      elt: origin,
      prop: asAhxCSSPropertyName(name),
    });
    return important && value ? value : attrValue ?? value;
  } else {
    return parseCssValue({ rule: origin, prop: asAhxCSSPropertyName(name) })
      .value;
  }
}
