import { asAhxAttributeName } from "./util/names.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type {
  AhxAttributeName,
  AhxCSSPropertyName,
  AhxName,
  ValueType,
} from "./types.ts";

export function parseAttrValue(
  prop: AhxName | AhxAttributeName | AhxCSSPropertyName,
  origin: Element,
  expect: ValueType = "tokens",
): string[] {
  prop = asAhxAttributeName(prop);
  const value = origin.getAttribute(prop) ?? undefined;
  return value ? (expect === "tokens" ? value.split(/\s+/) : [value]) : [];
}

export function parseAttrOrCssValue(
  prop: AhxName | AhxAttributeName | AhxCSSPropertyName,
  origin: Element | CSSStyleRule,
  expect: ValueType = "tokens",
): string[] {
  if (origin instanceof Element) {
    return parseAttrValue(prop, origin, expect);
  } else {
    return parseCssValue(prop, origin, undefined, expect);
  }
}
