import { getAhxCssValue } from "./get_ahx_value.ts";

export function parseInput(elt: Element): string | undefined {
  return getAhxCssValue(elt, "input");
}
