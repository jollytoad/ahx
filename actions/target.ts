import type { ActionConstruct, ActionResult } from "@ahx/types";
import {
  extendedSelectorAll,
  validateSelector,
} from "@ahx/common/extended-selector.ts";

/**
 * Select a node as the target for a swap or other action
 */
export const target: ActionConstruct = (...args) => {
  validateSelector(...args);

  return (context): ActionResult => {
    const targets = extendedSelectorAll(context, ...args);
    return (targets.length) ? { targets: [...targets] } : { break: true };
  };
};
