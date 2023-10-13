import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import type { ControlDecl } from "./types.ts";
import { querySelectorExt } from "./util/query_selector.ts";

export function parseTarget(elt: Element, control: ControlDecl): Element {
  const [targetQuery] = parseAttrOrCssValue("target", control, "whole");
  return querySelectorExt(elt, targetQuery) ?? elt;
}
