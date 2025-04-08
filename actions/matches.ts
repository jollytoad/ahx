import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

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
      isElement(target) && target.matches(selector)
    );
    return filtered?.length ? { targets: filtered } : { break: true };
  };
};
