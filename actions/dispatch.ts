import type { ActionConstruct } from "@ahx/types";
import * as log from "@ahx/common/logging.ts";

export const dispatch: ActionConstruct = (...args) => {
  const [eventType] = args;

  if (!eventType) {
    throw new TypeError("An event type is required");
  }

  return (context) => {
    if (!context.targets) return;

    let shouldBreak = false;

    for (const target of context.targets) {
      const event = new CustomEvent(eventType, {
        bubbles: true,
        cancelable: true,
        detail: context,
      });

      log.event(event, target);

      if (target.dispatchEvent(event) === false) {
        shouldBreak = true;
      }
    }

    return shouldBreak ? { break: true } : undefined;
  };
};
