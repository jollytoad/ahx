import { config } from "./config.ts";
import type { CSSPropertyName } from "./types.ts";

export function getStyleProps(rule: CSSStyleRule): Set<CSSPropertyName> {
  const props = new Set<CSSPropertyName>();
  for (const prop of rule.style) {
    if (isAhxProp(prop)) {
      props.add(prop);
    }
  }
  return props;
}

export function isAhxProp(prop: CSSPropertyName) {
  return prop.startsWith(`--${config.prefix}-`) ||
    config.customProps.includes(prop);
}
