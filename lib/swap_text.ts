import { swapAttr } from "./swap_attr.ts";
import { swapInput } from "./swap_input.ts";
import type { SwapTextProps } from "./types.ts";

export function swapText(props: SwapTextProps) {
  const { swapStyle } = props;

  switch (swapStyle) {
    case "input":
      return swapInput(props);
    case "attr":
      return swapAttr(props);
  }
}
