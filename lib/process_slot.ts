import { parseCssValue } from "./parse_css_value.ts";
import { getInternal } from "./util/internal.ts";

export function processSlot(rule: CSSStyleRule) {
  const slotNames = parseCssValue("slot-name", rule);
  if (slotNames.length) {
    const names = getInternal(rule, "slotName", () => new Set());
    slotNames.forEach((name) => names.add(name));
  }
}
