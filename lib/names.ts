import { config } from "./config.ts";
import type { AhxAttributeName, AhxCSSPropertyName, AhxName } from "./types.ts";

export function getAhxCSSPropertyNames(
  rule: CSSStyleRule,
): Set<AhxCSSPropertyName> {
  const names = new Set<AhxCSSPropertyName>();
  for (const name of rule.style) {
    if (isAhxCSSPropertyName(name)) {
      names.add(name);
    }
  }
  return names;
}

export function hasAhxAttributes(elt: Element): boolean {
  for (const attr of elt.attributes) {
    if (isAhxAttributeName(attr.name)) {
      return true;
    }
  }
  return false;
}

export function isAhxCSSPropertyName(name: string): name is AhxCSSPropertyName {
  return name.startsWith(`--${config.prefix}-`);
}

export function isAhxAttributeName(name: string): name is AhxAttributeName {
  return name.startsWith(`${config.prefix}-`);
}

export function asAhxCSSPropertyName(name: AhxName): AhxCSSPropertyName {
  return `--${config.prefix}-${name}`;
}

export function asAhxAttributeName(name: AhxName): AhxAttributeName {
  return `${config.prefix}-${name}`;
}
