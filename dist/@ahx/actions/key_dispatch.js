
import { dispatchToAll } from "@ahx/common/dispatch-to-all.js";

export const key_dispatch = (...args) => {
  const [, ...keyNames] = args;

  if (!keyNames.length) {
    throw new TypeError("At least one key name is required");
  }

  return ({ event, targets }) => {
    if (event instanceof KeyboardEvent && keyNames.includes(event.key)) {
      return dispatchToAll(
        targets,
        () =>
          new KeyboardEvent(`${event.type}-${event.key}`, {
            bubbles: true,
            cancelable: true,
            composed: event.composed,
            key: event.key,
            code: event.code,
            location: event.location,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            repeat: event.repeat,
            isComposing: event.isComposing,
            view: event.view,
          }),
      );
    }

    return { break: true };
  };
};
