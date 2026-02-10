
import { isElement } from "@ahx/common/guards.js";

export const target_attr = (_op, ...args) => {
  if (!args.length) {
    throw new TypeError("At least one attribute name is required");
  }

  return (context) => {
    const targets = new Set();

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
  node,
) {
    return typeof (node)?.getElementById === "function";
}
