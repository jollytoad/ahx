import { asAhxAttributeName } from "./names.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type {
  AhxAttributeName,
  AhxCSSPropertyName,
  AhxName,
  TriggerOrigin,
} from "./types.ts";

export interface AttrValueSpec {
  rule?: CSSStyleRule;
  elt?: Element;
  prop: AhxAttributeName | AhxCSSPropertyName;
  value?: string;
  important?: boolean;
}

export function parseAttrValue(
  origin: TriggerOrigin,
  prop: AhxName | AhxAttributeName | AhxCSSPropertyName,
): AttrValueSpec {
  if (origin instanceof Element) {
    prop = asAhxAttributeName(prop);
    const attrValue = origin.getAttribute(prop);
    const { rule, value, important } = parseCssValue({ elt: origin, prop });
    return {
      prop,
      elt: origin,
      value: important && value ? value : (attrValue ?? value),
      rule: important || !attrValue ? rule : undefined,
      important: important || !attrValue ? important : undefined,
    };
  } else {
    return parseCssValue({ rule: origin, prop });
  }
}
