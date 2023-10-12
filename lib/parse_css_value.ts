import { asAhxCSSPropertyName } from "./util/names.ts";
import type { AhxAttributeName, AhxCSSPropertyName, AhxName } from "./types.ts";

export interface CSSValueSpec {
  rule?: CSSStyleRule;
  prop: AhxCSSPropertyName;
  elt?: Element;
  value?: string;
  tokens?: string[];
  important?: boolean;
}

export function parseCssValue(
  prop: AhxName | AhxCSSPropertyName | AhxAttributeName,
  rule: CSSStyleRule,
  elt?: Element,
): CSSValueSpec {
  prop = asAhxCSSPropertyName(prop);

  const spec: CSSValueSpec = {
    rule,
    prop,
    elt,
    value: rule.style.getPropertyValue(prop)?.trim(),
    important: rule.style.getPropertyPriority(prop) === "important",
  };

  if (spec.value) {
    // match: attr(<name> <type?>)
    if (elt) {
      const isAttr = /^attr\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(
        spec.value,
      );
      if (isAttr) {
        spec.value = elt.getAttribute(isAttr[1]) ?? undefined;
        if (spec.value && isAttr[2] === "url") {
          spec.value = new URL(spec.value, elt.baseURI).href;
        }
        return spec;
      } else {
        // match: --prop(<name> <type?>)
        const isProp = /^--prop\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(
          spec.value,
        );
        if (isProp) {
          spec.value = undefined;
          const propValue = elt[isProp[1] as keyof Element];
          if (isProp[2] === "url" && typeof propValue === "string") {
            spec.value = new URL(propValue, elt.baseURI).href;
          } else if (
            typeof propValue === "string" || typeof propValue === "number" ||
            typeof propValue === "boolean"
          ) {
            spec.value = String(propValue);
          }
          return spec;
        }
      }
    }

    // match: url(<url?>)
    const isURL = /^url\(([^\)]*)\)$/.exec(spec.value);
    if (isURL) {
      spec.value = isURL[1];
    }

    spec.value = parseQuoted(spec.value);

    if (isURL) {
      const baseURL = rule.parentStyleSheet?.href ??
        rule.style.parentRule?.parentStyleSheet?.href ??
        elt?.baseURI;
      try {
        spec.value = new URL(spec.value, baseURL).href;
      } catch (e) {
        console.error(e, spec.value, baseURL);
      }
      return spec;
    }

    spec.tokens = spec.value.split(/\s+/).map(parseQuoted);
  }

  return spec;
}

function parseQuoted(value: string): string {
  // match: "<string?>" or '<string?>'
  const isQuoted = /^\"([^\"]*)\"$/.exec(value) ??
    /^\'([^\']*)\'$/.exec(value);
  if (isQuoted) {
    return isQuoted[1];
  }
  return value;
}
