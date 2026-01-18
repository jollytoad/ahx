
import {
  extendedSelector,
  validateSelector,
} from "@ahx/common/extended-selector.js";

export const target = (...args) => {
  validateSelector(...args);

  return (context) => {
    const targets = extendedSelector(context.targets, context, ...args);
    return (targets.length) ? { targets } : { break: true };
  };
};
