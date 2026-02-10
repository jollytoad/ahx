
import {
  createExpression,
  evaluateXPath,
  expandClassSyntax,
} from "@ahx/common/xpath-selector.js";

const target_xpathClass = (_op, ...args) => {
  const expression = createExpression(args, expandClassSyntax);

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

export default target_xpathClass;
