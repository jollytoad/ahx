
import { dispatchAhxEvent } from "./ahx-event.js";

const readyPending = new Set();
const readyDone = new WeakMap();

let readyHandle;

export function dispatchReady(control) {
  clearTimeout(readyHandle);

  for (const node of control.nodes()) {
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
