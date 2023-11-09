import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { parseInterval } from "./parse_interval.ts";
import type { ControlDecl, SwapSpec, SwapStyle } from "./types.ts";

export function parseSwap(control: ControlDecl) {
  const tokens = parseAttrOrCssValue("swap", control, "tokens");

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
          swapSpec.separator = parseSeparator(value);
          break;
        case "append":
          swapSpec.merge = "append";
          break;
      }
    }
  }

  return swapSpec;
}

function parseSeparator(value = " ") {
  switch (value) {
    case "space":
      return " ";
    case "comma":
      return ",";
    default:
      return value;
  }
}
