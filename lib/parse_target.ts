import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { querySelectorExt } from "./util/query_selector.ts";

export function parseTarget(elt: Element, rule?: CSSStyleRule): Element {
  const [targetQuery] = parseAttrOrCssValue("target", rule ?? elt, "whole");
  return querySelectorExt(elt, targetQuery) ?? elt;
}
