import type { ActionConstruct, ActionResult } from "@ahx/types";

/**
 * Select nodes by the id supplied in an attribute(s) of the current target(s).
 *
 * Example:
 * `target attr aria-controls`
 */
export const target_attr: ActionConstruct = (_op, ...args) => {
  if (!args.length) {
    throw new TypeError("At least one attribute name is required");
  }

  return (context): ActionResult => {
    const targets = new Set<Node>();

    for (const node of context.targets ?? []) {
      if (node instanceof Element) {
        const root = node.getRootNode();
        if (root instanceof Document || root instanceof DocumentFragment) {
          for (const attr of args) {
            const ids = node.getAttribute(attr)?.split(/\s+/) ?? [];
            for (const id of ids) {
              const target = root.getElementById(id);
              if (target) targets.add(target);
            }
          }
        }
      }
    }

    return targets.size ? { targets: [...targets] } : { break: true };
  };
};
