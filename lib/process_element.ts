import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { getInternal, setInternal } from "./internal.ts";
import { hasAhxAttributes } from "./names.ts";
import { processTriggers } from "./process_triggers.ts";

export function processElement(elt: Element) {
  if (hasAhxAttributes(elt)) {
    const detail = {
      owner: getInternal(elt, "owner"),
    };

    if (dispatchBefore(elt, "processElement", detail)) {
      if (detail.owner) {
        setInternal(elt, "owner", detail.owner);
      }

      processTriggers(elt, "click");

      dispatchAfter(elt, "processElement", detail);
    }
  }
}
