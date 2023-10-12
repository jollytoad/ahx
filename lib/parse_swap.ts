import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { parseInterval } from "./parse_interval.ts";
import type { SwapSpec, SwapStyle, TriggerOrigin } from "./types.ts";

export function parseSwap(origin: TriggerOrigin) {
  const tokens = parseAttrOrCssValue("swap", origin, "tokens");

  const swapSpec: SwapSpec = {};

  if (tokens?.length) {
    swapSpec.swapStyle = tokens.shift()?.toLowerCase() as SwapStyle;

    if (swapSpec.swapStyle === "attr" || swapSpec.swapStyle === "input") {
      swapSpec.itemName = tokens.shift();
    }

    for (const token of tokens) {
      const [modifier, value] = token.split(":");
      switch (modifier) {
        case "swap":
        case "delay":
          swapSpec.delay = parseInterval(value);
          break;
        case "join":
          swapSpec.merge = "join";
          break;
        case "append":
          swapSpec.merge = "append";
          break;
      }
    }
  }

  return swapSpec;
}
