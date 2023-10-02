import { getAhxCssValue } from "./get_ahx_value.ts";
import type { AhxName } from "./types.ts";

export function findTarget(
  elt: Element,
  ahxName: AhxName = "target",
): Element | undefined {
  const targetStr = getAhxCssValue(elt, ahxName);

  if (targetStr) {
    if (targetStr.startsWith("closest ")) {
      return elt.closest(targetStr.substring(8)) ?? undefined;
    } else {
      return elt.querySelector(targetStr) ?? undefined;
    }
  }
}
