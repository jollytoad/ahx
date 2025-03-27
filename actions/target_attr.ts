import type { ActionConstruct, ActionResult } from "@ahx/types";

/**
 * Select nodes by the id supplied in an attribute(s) of the current target(s).
 *
 * Example:
 * `target attr aria-controls`
 */
export const target_attr: ActionConstruct = (...args) => {
  if (!args.length) {
    throw new TypeError("At least one attribute name is required");
  }

  return (context): ActionResult => {
    const targets = context.targets?.flatMap((node) => {
      if (node instanceof Element) {
        const root = node.getRootNode();
        if (root instanceof Document || root instanceof DocumentFragment) {
          for (const attr of args) {
            const id = node.getAttribute(attr);
            if (id) {
              const target = root.getElementById(id);
              if (target) return [target];
            }
          }
        }
      }
      return [];
    });
    return targets?.length ? { targets } : { break: true };
  };
};
