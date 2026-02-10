
import { isElement } from "@ahx/common/guards.js";

export const matches = (...args) => {
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }

  const selector = args.join(" ");

  return ({ targets }) => {
    const filtered = targets?.filter((target) =>
      isElement(target) && target.matches(selector)
    );
    return filtered?.length ? { targets: filtered } : { break: true };
  };
};
