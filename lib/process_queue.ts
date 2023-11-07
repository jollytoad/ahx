import { handleAction } from "./handle_action.ts";
import { parseTarget } from "./parse_target.ts";
import { getOwner } from "./util/owner.ts";
import { dequeueAction, queue } from "./util/queue.ts";

export function processQueue() {
  for (const detail of queue()) {
    const target = parseTarget(detail.source, detail.control);

    if (target instanceof Element) {
      dequeueAction(detail);

      handleAction({
        ...detail,
        target,
        targetOwner: getOwner(target),
      });
    }
  }
}
