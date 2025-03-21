import type { ActionConstruct, Control } from "@ahx/types";
import * as log from "@ahx/common/logging.ts";

const done = new WeakSet<Control>();

export const once: ActionConstruct = () => ({ control }) => {
  if (done.has(control)) {
    return { break: true };
  } else {
    done.add(control);
  }
};

export const preventDefault: ActionConstruct = () => ({ event }) => {
  event.preventDefault();
};

export const stopPropagation: ActionConstruct = () => ({ event }) => {
  event.stopPropagation();
};

export const stopImmediatePropagation: ActionConstruct = () => ({ event }) => {
  event.stopImmediatePropagation();
};

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
