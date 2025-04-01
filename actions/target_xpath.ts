import type { ActionConstruct, ActionResult } from "@ahx/types";
import { createExpression, evaluateXPath } from "@ahx/common/xpath-selector.ts";

/**
 * Select target nodes using an XPath 1.0 expression.
 */
export const target_xpath: ActionConstruct = (_op, ...args) => {
  const expression = createExpression(args);

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
