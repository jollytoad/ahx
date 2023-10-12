import { asAhxAttributeName } from "./util/names.ts";
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
  tokens?: string[];
  important?: boolean;
}

export function parseAttrValue(
  prop: AhxName | AhxAttributeName | AhxCSSPropertyName,
  origin: TriggerOrigin,
): AttrValueSpec {
  if (origin instanceof Element) {
    prop = asAhxAttributeName(prop);
    const value = origin.getAttribute(prop) ?? undefined;
    return {
      prop,
      elt: origin,
      value,
      tokens: value?.split(/\s+/),
    };
  } else {
    return parseCssValue(prop, origin);
  }
}
