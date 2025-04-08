import type { ActionConstruct } from "@ahx/types";
import { dispatchToAll } from "@ahx/common/dispatch-to-all.ts";

export const dispatch: ActionConstruct = (...args) => {
  const [eventType] = args;

  if (!eventType) {
    throw new TypeError("An event type is required");
  }

  return (context) =>
    dispatchToAll(context.targets, () =>
      new CustomEvent(eventType, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: context,
      }));
};
