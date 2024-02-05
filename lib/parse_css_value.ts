import { asAhxCSSPropertyName } from "./util/names.ts";
import type {
  AhxAttributeName,
  AhxCSSPropertyName,
  ControlPropName,
  ValueType,
} from "./types.ts";
import { resolveElement } from "./util/resolve_element.ts";

export function parseCssValue(
  prop: ControlPropName | AhxCSSPropertyName | AhxAttributeName,
  rule: CSSStyleRule,
  elt?: Element,
  expect: ValueType = "tokens",
): string[] {
  prop = asAhxCSSPropertyName(prop);

  let value: string | undefined = rule.style.getPropertyValue(prop)?.trim();

  if (value) {
    // match: attr(<name> <type?>)
    const isAttr = /^attr\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(value);
    if (isAttr) {
      if (!elt) {
        return [value];
      }
      value = elt.getAttribute(isAttr[1]!) ?? undefined;
      if (value && isAttr[2] === "url") {
        value = parseURL(value, elt.baseURI);
      }
      return value ? [value] : [];
    } else {
      // match: --prop(<name> <type?>)
      const isProp = /^--prop\(([^\)\s,]+)(?:\s+([^\)\s,]+))?\)$/.exec(value);
      if (isProp) {
        if (!elt) {
          return [value];
        }
        value = undefined;
        const propValue = elt[isProp[1] as keyof Element];
        if (isProp[2] === "url" && typeof propValue === "string") {
          value = parseURL(propValue, elt.baseURI);
        } else if (
          typeof propValue === "string" || typeof propValue === "number" ||
          typeof propValue === "boolean"
        ) {
          value = String(propValue);
        }
        return value ? [value] : [];
      }
    }

    // match: url(<url?>) ...
    const isURL = /^url\(([^\)]*)\)(?:\s+url\(([^\)]*)\))*$/.exec(value);
    if (isURL) {
      const [, ...values] = isURL;
      const baseURL = rule.parentStyleSheet?.href ??
        rule.style.parentRule?.parentStyleSheet?.href ??
        elt?.baseURI ??
        resolveElement(rule)?.baseURI;

      return values.flatMap((value) => {
        const url = value ? parseURL(parseQuoted(value), baseURL) : undefined;
        return url ? [url] : [];
      });
    }

    value = parseQuoted(value);
  }

  return value
    ? (expect === "tokens" ? value.split(/\s+/).map(parseQuoted) : [value])
    : [];

  function parseURL(value: string, baseURL?: string) {
    try {
      return new URL(value, baseURL).href;
    } catch (e) {
      console.error(e, value, baseURL);
    }
  }
}

function parseQuoted(value: string): string {
  // match: "<string?>" or '<string?>'
  const isQuoted = /^\"([^\"]*)\"$/.exec(value) ??
    /^\'([^\']*)\'$/.exec(value);
  if (isQuoted) {
    return isQuoted[1]!;
  }
  return value;
}
