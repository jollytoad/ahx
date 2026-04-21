import type { ActionConstruct, ActionResult, PayloadNodes } from "@ahx/types";
import { swap as doSwap, type SwapOp } from "@ahx/common/swap.ts";
import { isElement } from "@ahx/common/guards.ts";

export const swap: ActionConstruct = (...args) => {
  const op: SwapOp = args[0] as SwapOp ?? "inner";

  return async (
    { targets, texts, nodes, response, initialTarget, control },
  ): Promise<ActionResult | undefined> => {
    if (!targets) return;

    if (!nodes && !texts && response) {
      texts = [await response.text()];
    }

    if (
      !nodes && !texts && isElement(initialTarget) &&
      initialTarget !== control.root
    ) {
      nodes = [initialTarget];
    }

    if (isAsyncIterable(nodes)) {
      // When we have an async iteration of nodes, there is the chance that
      // a node may be moved or mutated before the next node arrives, causing
      // it to fail to insert or insert into the wrong place. So we create a
      // dummy 'cursor' node first that nodes are then inserted before.

      // Insert a placeholder 'cursor' node into the targets
      const cursors = [...swapToTargets(op, targets, createCursorNode)];

      for await (const node of nodes) {
        // Insert the swapped node before all 'cursor' nodes
        for (const _ of swapToTargets("before", cursors, clonesOf(node))) {
          // ignore the swapped node
        }
      }
    } else if (nodes) {
      // Otherwise if we have a sync iteration of nodes, we can swap the
      // first into place, and append subsequent nodes after that and each
      // other without the need of a cursor.

      let effectiveOp = op;

      for (const node of nodes) {
        // Swap the node to all of the targets, and set the next set of targets
        // to the swapped in nodes
        targets = [...swapToTargets(effectiveOp, targets, clonesOf(node))];

        // Change the op to append further nodes after those swapped in
        effectiveOp = "after";
      }
    } else if (texts) {
      const content = texts?.join("\n");

      for (const target of targets) {
        doSwap(op, target, content);
      }
    }
  };
};

function isAsyncIterable(nodes?: PayloadNodes): nodes is AsyncIterable<Node> {
  return !!nodes && Symbol.asyncIterator in nodes &&
    typeof nodes[Symbol.asyncIterator] === "function";
}

function* swapToTargets(
  op: SwapOp,
  targets: Node[],
  source: (target: Node) => Node | undefined,
): Iterable<Node> {
  for (const target of targets) {
    const node = source(target);
    if (node) {
      doSwap(op, target, node);
      yield node;
    }
  }
}

function createCursorNode(target: Node) {
  return target.ownerDocument?.createTextNode("");
}

function clonesOf(node: Node) {
  let clone = false;
  return () => {
    try {
      return clone ? node.cloneNode(true) : node;
    } finally {
      clone = true;
    }
  };
}
