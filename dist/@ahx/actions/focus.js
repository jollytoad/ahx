
import { isElement } from "@ahx/common/guards.js";

export const focus = () => ({ targets }) => {
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

function isFocusable(node) {
  return typeof (node).focus === "function";
}
