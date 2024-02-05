import { parseAttrValue } from "./parse_attr_value.ts";
import { parseSlotSwap } from "./parse_swap.ts";
import type { SlotSpec } from "./types.ts";

export function parseSlot(element: Element): SlotSpec {
  const [slot, ...selectorParts] = parseAttrValue("slot", element, "tokens");
  const selector = selectorParts.join(" ");
  const slotSpec = parseSlotSwap(element);

  return {
    slot,
    selector,
    ...slotSpec,
  };
}
