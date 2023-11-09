import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { getInternal } from "./util/internal.ts";
import type { SwapDetail, SwapTextProps } from "./types.ts";

export function swapInput(props: SwapTextProps) {
  const { target, itemName, merge, separator, value } = props;

  if (!itemName || value === undefined) {
    // TODO: consider dispatching an error event (at least for no itemName)
    return;
  }

  const detail: SwapDetail = {
    ...props,
  };

  if (target instanceof HTMLFormElement) {
    detail.input = target.elements.namedItem(itemName) ?? undefined;

    switch (merge) {
      case "append":
        detail.input = createInput(itemName, target.ownerDocument);
        break;

      default:
        if (!detail.input) {
          detail.input = createInput(itemName, target.ownerDocument);
        } else if ("value" in detail.input) {
          detail.oldValue = detail.input.value;
        }
        break;
    }
  } else {
    detail.formData = getInternal(target, "formData", () => new FormData());
    const oldValue = detail.formData.get(itemName);
    if (typeof oldValue === "string") {
      detail.oldValue = oldValue;
    }
  }

  if (merge === "join") {
    detail.value = join(detail.oldValue, detail.value, separator);
  }

  if (dispatchBefore(target, "swap", detail)) {
    const { target, input, itemName, merge, formData, value } = detail;

    if (itemName && value !== undefined) {
      if (input && "value" in input) {
        input.value = value;
        if (input instanceof Element && !input.parentElement) {
          target.insertAdjacentElement("beforeend", input);
        }
      } else if (formData) {
        if (merge === "append") {
          formData.append(itemName, value);
        } else {
          formData.set(itemName, value);
        }
      }
    }

    dispatchAfter(target, "swap", detail);
  }
}

function createInput(name: string, document: Document) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  return input;
}

function join(oldValue = "", newValue = "", sep = " ") {
  const values = new Set(`${oldValue}${sep}${newValue}`.split(sep));
  values.delete("");
  return [...values].join(sep);
}
