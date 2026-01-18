
import { createExpression, evaluateXPath } from "@ahx/common/xpath-selector.js";

export const target_xpath = (_op, ...args) => {
  const expression = createExpression(args);

  return (context) => {
    if (context.targets) {
      const targets = evaluateXPath(context.targets, expression);
      if (targets.length) {
        return { targets };
      }
    }
    return { break: true };
  };
};
