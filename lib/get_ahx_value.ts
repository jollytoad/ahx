import { type Key, objectsWithInternal } from "./internal.ts";
import { asAhxAttributeName, asAhxCSSPropertyName } from "./names.ts";
import { type CSSValueSpec, parseCssValue } from "./parse_css_value.ts";
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
    return important && value ? value : (attrValue ?? value);
  } else {
    return parseCssValue({ rule: origin, prop: asAhxCSSPropertyName(name) })
      .value;
  }
}

export function getAhxCssValue(
  origin: TriggerOrigin,
  name: AhxName,
): string | undefined {
  const rule = origin instanceof CSSStyleRule ? origin : undefined;
  const elt = origin instanceof Element ? origin : undefined;
  return parseCssValue({ rule, elt, prop: asAhxCSSPropertyName(name) }).value;
}

export function findMatchingRules(
  elt: Element,
  internalKey: Key,
  ahxName: AhxName,
) {
  const prop = asAhxCSSPropertyName(ahxName);
  const computedValue = getComputedStyle(elt).getPropertyValue(
    asAhxCSSPropertyName(ahxName),
  );

  if (computedValue) {
    const rules = objectsWithInternal(internalKey);
    const matches: CSSValueSpec[] = [];

    for (const [rule] of rules) {
      if (rule instanceof CSSStyleRule) {
        if (elt.matches(rule.selectorText)) {
          matches.push(parseCssValue({ rule, elt, prop }));
        }
      }
    }

    return matches;
  }
  return [];
}
