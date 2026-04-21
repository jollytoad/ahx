import type { Control } from "@ahx/types";
import { dispatchAhxEvent } from "./ahx-event.ts";

const readyPending = new Set<Node>();
const readyDone = new WeakMap<Node, WeakSet<Control>>();

let readyHandle: number | undefined;

export function dispatchReady(control: Control) {
  clearTimeout(readyHandle);

  for (const node of control.nodes()) {
    // Has this control already been triggered on this node?
    if (!readyDone.get(node)?.has(control)) {
      readyDone.getOrInsertComputed(node, () => new WeakSet()).add(control);
      readyPending.add(node);
    }
  }

  readyHandle = setTimeout(() => {
    for (const node of readyPending) {
      readyPending.delete(node);
      dispatchAhxEvent("ready", node, { composed: false });
    }
  }, 1);
}
