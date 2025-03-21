import type { ActionConstruct, ActionResult } from "@ahx/types";

/**
 * Filter the targets that match the given selector,
 * and only continue the pipeline if at least one matches.
 */
export const matches: ActionConstruct = (...args) => {
  if (!args.length) {
    throw new TypeError("A CSS selector is required");
  }

  const selector = args.join(" ");

  return ({ targets }): ActionResult | undefined => {
    const filtered = targets?.filter((target) =>
      target instanceof Element && target.matches(selector)
    );
    return filtered?.length ? { targets: filtered } : { break: true };
  };
};
