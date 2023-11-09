import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import type { SwapTextDetail, SwapTextProps } from "./types.ts";

export function swapAttr(props: SwapTextProps) {
  const { target, itemName, merge, separator } = props;

  const detail: SwapTextDetail = {
    ...props,
  };

  detail.oldValue = target.getAttribute(itemName) ?? undefined;

  if (merge === "join" && detail.oldValue && detail.value) {
    detail.value = join(detail.oldValue, detail.value, separator);
  }

  if (dispatchBefore(target, "swap", detail)) {
    const { target, itemName, value } = detail;

    if (itemName && value !== undefined) {
      target.setAttribute(itemName, value);
    }

    dispatchAfter(target, "swap", detail);
  }
}

function join(oldValue: string, newValue: string, sep = " ") {
  const values = new Set(`${oldValue}${sep}${newValue}`.split(sep));
  values.delete("");
  return [...values].join(sep);
}
