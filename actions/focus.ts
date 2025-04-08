import type { ActionConstruct } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export const focus: ActionConstruct = () => ({ targets }) => {
  if (targets) {
    for (const target of targets) {
      if (isElement(target) && isFocusable(target)) {
        target.focus();
        if (
          target.ownerDocument.activeElement === target &&
          target.ownerDocument.hasFocus()
        ) {
          return;
        }
      }
    }
  }
};

function isFocusable(node: Element): node is Element & { focus(): void } {
  return typeof (node as HTMLElement).focus === "function";
}
