// Adapted from https://github.com/bigskysoftware/htmx/blob/master/src/htmx.js (see LICENSE_htmx)

import { config } from "./config.ts";
import { getAhxValue } from "./get_ahx_value.ts";
import { parseInterval } from "./parse_interval.ts";
import type { SwapSpec, SwapStyle } from "./types.ts";

export function parseSwap(elt: Element, swapInfoOverride?: string) {
  const swapInfo = swapInfoOverride || getAhxValue(elt, "swap");

  const swapSpec: SwapSpec = {
    swapStyle: config.defaultSwapStyle,
    swapDelay: config.defaultSwapDelay,
    settleDelay: config.defaultSettleDelay,
  };

  if (swapInfo) {
    const split = swapInfo.trim().split(/\s+/);
    if (split[0] && !split[0].includes(":")) {
      swapSpec.swapStyle = split[0].toLowerCase() as SwapStyle;
    }
    for (const token of split) {
      if (token.includes(":")) {
        const [modifier, value] = token.split(":");
        switch (modifier) {
          case "swap":
            swapSpec.swapDelay = parseInterval(value) ?? swapSpec.swapDelay;
            break;
          case "settle":
            swapSpec.settleDelay = parseInterval(value) ?? swapSpec.settleDelay;
            break;
        }
      }
    }
  }

  return swapSpec;
}
