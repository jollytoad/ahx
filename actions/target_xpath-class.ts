import type { ActionConstruct, ActionResult } from "@ahx/types";
import {
  createExpression,
  evaluateXPath,
  expandClassSyntax,
} from "@ahx/common/xpath-selector.ts";

/**
 * Select target nodes using an XPath 1.0 expression with an
 * extended syntax that allows `.class` names to be appended
 * to element names and wildcards.
 */
const target_xpathClass: ActionConstruct = (_op, ...args) => {
  const expression = createExpression(args, expandClassSyntax);

  return (context): ActionResult => {
    if (context.targets) {
      const targets = evaluateXPath(context.targets, expression);
      if (targets.length) {
        return { targets };
      }
    }
    return { break: true };
  };
};

export default target_xpathClass;
