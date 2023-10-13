import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { hasAhxAttributes } from "./util/names.ts";
import { getOwner, setOwner } from "./util/owner.ts";
import { processControls } from "./process_controls.ts";

export function processElement(elt: Element) {
  if (hasAhxAttributes(elt)) {
    const detail = {
      owner: getOwner(elt),
    };

    if (dispatchBefore(elt, "processElement", detail)) {
      if (detail.owner) {
        setOwner(elt, detail.owner);
      }

      processControls(elt);

      dispatchAfter(elt, "processElement", detail);
    }
  }
}
