import type { ActionConstruct } from "@ahx/types";

/**
 * Filter key events based on the key property
 */
export const key: ActionConstruct = (...keyNames) => {
  if (!keyNames.length) {
    throw new TypeError("At least one key name is required");
  }

  return ({ event }) => {
    if (event instanceof KeyboardEvent && keyNames.includes(event.key)) {
      return;
    }
    return { break: true };
  };
};
