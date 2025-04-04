import type { ActionConstruct } from "@ahx/types";
import { getControl } from "@ahx/common/controls.ts";

/**
 * Abort an active control pipeline.
 */
export const abort: ActionConstruct = (...args) => {
  const [eventType] = args;
  return async (context): Promise<void> => {
    const { control, targets, event } = context;
    const source = control.source;

    // If we are in a rule control with a single target matching the event target,
    // then assume we should abort the source of the control
    if (
      control.isRule && targets?.length === 1 && targets[0] === event.target
    ) {
      const targetControl = eventType
        ? await getControl(source, eventType)
        : control;
      targetControl?.abort(context);
    } else if (targets) {
      for (const target of targets) {
        if (target instanceof Element) {
          (await getControl(target, eventType ?? event.type))?.abort();
        }
      }
    }
  };
};
