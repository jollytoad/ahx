import { asAhxAttributeName } from "./util/names.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type {
  AhxAttributeName,
  AhxCSSPropertyName,
  ControlPropName,
  ValueType,
} from "./types.ts";

export function parseAttrValue(
  prop: ControlPropName | AhxAttributeName | AhxCSSPropertyName,
  control: Element,
  expect: ValueType = "tokens",
): string[] {
  prop = asAhxAttributeName(prop);
  const value = control.getAttribute(prop) ?? undefined;
  return value ? (expect === "tokens" ? value.split(/\s+/) : [value]) : [];
}

export function parseAttrOrCssValue(
  prop: ControlPropName | AhxAttributeName | AhxCSSPropertyName,
  control: Element | CSSStyleRule,
  expect: ValueType = "tokens",
): string[] {
  if (control instanceof Element) {
    return parseAttrValue(prop, control, expect);
  } else {
    return parseCssValue(prop, control, undefined, expect);
  }
}
