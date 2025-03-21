import type { ActionConstruct, ActionResult } from "@ahx/types";
import {
  extendedSelectorAll,
  validateSelector,
} from "@ahx/common/extended-selector.ts";

/**
 * Select a node for a swap or other action
 */
export const select: ActionConstruct = (...args) => {
  validateSelector(...args);

  return (context): ActionResult => {
    const nodes = extendedSelectorAll(context, ...args);
    return nodes ? { nodes, texts: undefined } : { break: true };
  };
};
