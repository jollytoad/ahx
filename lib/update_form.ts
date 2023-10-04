import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { getInternal } from "./internal.ts";
import type { UpdateFormDetail } from "./types.ts";

export function updateForm(detail: UpdateFormDetail) {
  const { target, inputName, inputModifier, inputSeparator } = detail;

  if (target instanceof HTMLFormElement) {
    detail.input = target.elements.namedItem(inputName) ?? undefined;

    switch (inputModifier) {
      case "append":
        detail.input = createInput(inputName, target.ownerDocument);
        break;

      case "join":
      case "replace":
        if (!detail.input) {
          detail.input = createInput(inputName, target.ownerDocument);
        } else if ("value" in detail.input) {
          detail.oldValue = detail.input.value;
        }
        break;
    }
  } else {
    detail.formData = getInternal(target, "formData", () => new FormData());
    detail.oldValue = detail.formData.get(inputName) ?? undefined;
  }

  if (inputModifier === "join") {
    const values = new Set<string>(
      String(detail.oldValue ?? "").split(inputSeparator ?? " "),
    );
    values.add(detail.newValue);
    detail.newValue = [...values].join(inputSeparator ?? " ");
  }

  if (dispatchBefore(target, "updateForm", detail)) {
    const { target, input, inputName, inputModifier, formData, newValue } =
      detail;

    if (input && "value" in input) {
      input.value = newValue;
      if (input instanceof Element && !input.parentElement) {
        target.insertAdjacentElement("beforeend", input);
      }
    } else if (formData) {
      if (inputModifier === "append") {
        formData.append(inputName, newValue);
      } else {
        formData.set(inputName, newValue);
      }
    }

    dispatchAfter(target, "updateForm", detail);
  }
}

function createInput(name: string, document: Document) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  return input;
}
