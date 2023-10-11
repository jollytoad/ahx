import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { SwapTextDetail, SwapTextProps } from "./types.ts";

export function swapAttr(props: SwapTextProps) {
  const { target, itemName, merge } = props;

  const detail: SwapTextDetail = {
    ...props,
  };

  detail.oldValue = target.getAttribute(itemName) ?? undefined;

  if (merge === "join" && detail.oldValue && detail.value) {
    detail.value = join(detail.oldValue, detail.value);
  }

  if (dispatchBefore(target, "swap", detail)) {
    const { target, itemName, value } = detail;

    if (itemName && value !== undefined) {
      target.setAttribute(itemName, value);
    }

    dispatchAfter(target, "swap", detail);
  }
}

function join(oldValue: string, newValue: string) {
  const sep = " ";
  const values = new Set(`${oldValue}${sep}${newValue}`.split(sep));
  values.delete("");
  return [...values].join(sep);
}
