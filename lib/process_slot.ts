import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import type { ControlDecl } from "./types.ts";
import { getInternal } from "./util/internal.ts";

export function processSlot(control: ControlDecl) {
  const slotNames = parseAttrOrCssValue("slot-name", control, "tokens");
  if (slotNames.length) {
    const names = getInternal(control, "slotName", () => new Set());
    slotNames.forEach((name) => names.add(name));
  }
}
