import type { ActionConstruct, Control } from "@ahx/types";

const done = new WeakSet<Control>();

export const once: ActionConstruct = () => ({ control }) => {
  if (done.has(control)) {
    return { break: true };
  } else {
    done.add(control);
  }
};
