import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import type { ControlDecl } from "./types.ts";
import { querySelectorExt } from "./util/query_selector.ts";

export function parseTarget(
  elt: Element,
  control: ControlDecl,
): Element | "await" {
  let [targetQuery = ""] = parseAttrOrCssValue("target", control, "whole");
  const hasAwait = /^await\s+/.test(targetQuery);

  if (hasAwait) {
    targetQuery = targetQuery.substring(5).trimStart();
  }

  const target = querySelectorExt(elt, targetQuery);

  if (hasAwait) {
    return target ?? "await";
  } else {
    return target ?? elt;
  }
}
