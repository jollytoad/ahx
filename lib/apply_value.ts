import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { getInternal } from "./internal.ts";
import type { ApplyValueDetail, TargetType } from "./types.ts";

export function applyValue(detail: ApplyValueDetail) {
  const { prepare, perform } = handlers[detail.type];

  prepare(detail);

  if (dispatchBefore(detail.target, "applyValue", detail)) {
    perform(detail);

    dispatchAfter(detail.target, "applyValue", detail);
  }
}

interface Handler {
  prepare(detail: ApplyValueDetail): void;
  perform(detail: ApplyValueDetail): void;
}

const input: Handler = {
  prepare(detail) {
    const { target, name, modifier } = detail;

    if (target instanceof HTMLFormElement) {
      detail.input = target.elements.namedItem(name) ?? undefined;

      switch (modifier) {
        case "append":
          detail.input = createInput(name, target.ownerDocument);
          break;

        case "join":
        case "replace":
          if (!detail.input) {
            detail.input = createInput(name, target.ownerDocument);
          } else if ("value" in detail.input) {
            detail.oldValue = detail.input.value;
          }
          break;
      }
    } else {
      detail.formData = getInternal(target, "formData", () => new FormData());
      const oldValue = detail.formData.get(name);
      if (typeof oldValue === "string") {
        detail.oldValue = oldValue;
      }
    }

    if (modifier === "join") {
      detail.newValue = join(detail);
    }
  },
  perform(detail) {
    const { target, input, name, modifier, formData, newValue } = detail;

    if (input && "value" in input) {
      input.value = newValue;
      if (input instanceof Element && !input.parentElement) {
        target.insertAdjacentElement("beforeend", input);
      }
    } else if (formData) {
      if (modifier === "append") {
        formData.append(name, newValue);
      } else {
        formData.set(name, newValue);
      }
    }
  },
};

const attr: Handler = {
  prepare(detail) {
    const { target, name, modifier } = detail;
    detail.oldValue = target.getAttribute(name) ?? undefined;

    if (modifier === "append" || modifier === "join") {
      detail.newValue = join(detail);
    }
  },
  perform({ target, name, newValue }) {
    target.setAttribute(name, newValue);
  },
};

const handlers: Record<TargetType, Handler> = {
  input,
  attr,
};

function createInput(name: string, document: Document) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  return input;
}

function join(detail: ApplyValueDetail) {
  const { oldValue, newValue } = detail;

  const sep = detail.separator ?? " ";
  const values = new Set(`${oldValue ?? ""}${sep}${newValue ?? ""}`.split(sep));
  values.delete("");
  return [...values].join(sep);
}
