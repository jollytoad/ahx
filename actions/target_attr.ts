import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

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
      if (isElement(node)) {
        const root = node.getRootNode();
        if (isDocumentOrFragment(root)) {
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

function isDocumentOrFragment(
  node: unknown,
): node is { getElementById(id: string): Element | null } {
  // deno-lint-ignore no-explicit-any
  return typeof (node as any)?.getElementById === "function";
}
