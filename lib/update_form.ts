import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { getInternal } from "./internal.ts";
import type { ValueDetail } from "./types.ts";

export function updateForm(target: Element, inputName: string, value: string) {
  const detail: ValueDetail = {
    target,
    inputName,
    newValue: value,
  };

  if (target instanceof HTMLFormElement) {
    detail.input = target.elements.namedItem(inputName) ?? undefined;

    if (!detail.input) {
      const hiddenInput = target.ownerDocument.createElement("input");
      hiddenInput.type = "hidden";
      detail.input = hiddenInput;
    } else if ("value" in detail.input) {
      detail.oldValue = detail.input.value;
    }
  } else {
    detail.formData = getInternal(target, "formData", () => new FormData());
    detail.oldValue = detail.formData.get(inputName) ?? undefined;
  }

  if (dispatchBefore(target, "updateForm", detail)) {
    const { target, input, inputName, formData, newValue } = detail;

    if (input && "value" in input) {
      input.value = newValue;
      if (input instanceof Element && !input.parentElement) {
        target.insertAdjacentElement("beforeend", input);
      }
    } else if (formData) {
      formData.set(inputName, newValue);
    }

    dispatchAfter(target, "updateForm", detail);
  }
}
