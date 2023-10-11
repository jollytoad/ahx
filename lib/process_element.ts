import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { hasAhxAttributes } from "./util/names.ts";
import { getOwner, setOwner } from "./util/owner.ts";
import { processTriggers } from "./process_triggers.ts";

export function processElement(elt: Element) {
  if (hasAhxAttributes(elt)) {
    const detail = {
      owner: getOwner(elt),
    };

    if (dispatchBefore(elt, "processElement", detail)) {
      if (detail.owner) {
        setOwner(elt, detail.owner);
      }

      processTriggers(elt, "click");

      dispatchAfter(elt, "processElement", detail);
    }
  }
}
