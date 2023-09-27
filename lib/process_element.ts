import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { hasAhxAttributes } from "./names.ts";
import { processTriggers } from "./process_triggers.ts";

export function processElement(elt: Element) {
  if (hasAhxAttributes(elt)) {
    const detail = {};

    if (dispatchBefore(elt, "processElement", detail)) {
      processTriggers(elt, "click");

      dispatchAfter(elt, "processElement", detail);
    }
  }
}
