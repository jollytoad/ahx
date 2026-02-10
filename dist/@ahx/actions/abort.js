
import { getControl } from "@ahx/common/controls.js";
import { isElement } from "@ahx/common/guards.js";

export const abort = (...args) => {
  const [eventType] = args;
  return async (context) => {
    const { control, targets, event, initialTarget } = context;
    const source = control.source;

            if (
      control.isRule && targets?.length === 1 && targets[0] === initialTarget
    ) {
      const targetControl = eventType
        ? await getControl(source, eventType)
        : control;
      targetControl?.abort(context);
    } else if (targets) {
      for (const target of targets) {
        if (isElement(target)) {
          (await getControl(target, eventType ?? event.type))?.abort();
        }
      }
    }
  };
};
