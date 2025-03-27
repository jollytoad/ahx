import type { ActionConstruct, ActionResult } from "@ahx/types";
import {
  extendedSelector,
  validateSelector,
} from "@ahx/common/extended-selector.ts";
import { getSourceNodes } from "@ahx/common/source-nodes.ts";

/**
 * Select a node for a swap or other action
 */
export const select: ActionConstruct = (...args) => {
  validateSelector(...args);

  return async (context): Promise<ActionResult> => {
    const scope = await getSourceNodes(context);
    const nodes = extendedSelector(scope, context, ...args);
    return nodes.length ? { nodes, texts: undefined } : { break: true };
  };
};
