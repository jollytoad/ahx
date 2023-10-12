import { asAhxAttributeName } from "./util/names.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type {
  AhxAttributeName,
  AhxCSSPropertyName,
  AhxName,
  TriggerOrigin,
} from "./types.ts";

export function parseAttrValue(
  prop: AhxName | AhxAttributeName | AhxCSSPropertyName,
  origin: TriggerOrigin,
): string[] {
  if (origin instanceof Element) {
    prop = asAhxAttributeName(prop);
    const value = origin.getAttribute(prop) ?? undefined;
    return value?.split(/\s+/) ?? [];
  } else {
    return parseCssValue(prop, origin);
  }
}
