import type { ActionResult } from "@ahx/types";
import * as log from "@ahx/custom/log/event.ts";

export function dispatchToAll<T extends EventTarget>(
  targets: T[] | undefined,
  createEvent: (target: T) => Event,
): ActionResult | void {
  if (!targets?.length) return;

  let shouldBreak = false;

  for (const target of targets) {
    const event = createEvent(target);

    log.event(event, target);

    if (target.dispatchEvent(event) === false) {
      shouldBreak = true;
    }
  }

  return shouldBreak ? { break: true } : undefined;
}
