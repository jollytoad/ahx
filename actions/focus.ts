import type { ActionConstruct } from "@ahx/types";

export const focus: ActionConstruct = () => ({ targets }) => {
  if (targets) {
    for (const target of targets) {
      if (target instanceof HTMLElement) {
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
