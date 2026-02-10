
import {
  extendedSelector,
  validateSelector,
} from "@ahx/common/extended-selector.js";
import { getSourceNodes } from "@ahx/common/source-nodes.js";

export const select = (...args) => {
  validateSelector(...args);

  return async (context) => {
    const scope = await getSourceNodes(context);
    const nodes = extendedSelector(scope, context, ...args);
    return nodes.length ? { nodes, texts: undefined } : { break: true };
  };
};
