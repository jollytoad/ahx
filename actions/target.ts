import type { ActionConstruct, ActionResult } from "@ahx/types";
import {
  extendedSelector,
  validateSelector,
} from "@ahx/common/extended-selector.ts";

/**
 * Select a node as the target for a swap or other action
 */
export const target: ActionConstruct = (...args) => {
  validateSelector(...args);

  return (context): ActionResult => {
    const targets = extendedSelector(context.targets, context, ...args);
    return (targets.length) ? { targets } : { break: true };
  };
};
