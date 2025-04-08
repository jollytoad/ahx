import type { ActionConstruct, ActionResult } from "@ahx/types";
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

    if (nodes) {
      let effectiveOp = op;

      for await (const node of nodes) {
        const tails: Node[] = [];

        let clone = false;
        for (const target of targets) {
          const swapped = doSwap(
            effectiveOp,
            target,
            clone ? node.cloneNode(true) : node,
          );
          if (swapped) {
            tails.push(swapped);
          }
          clone = true;
        }

        // Set targets to the nodes that have just been swapped in
        targets = tails;
        // Change the op to append further nodes after those swapped in
        effectiveOp = "afterend";
      }
    } else if (texts) {
      const content = texts?.join("\n");

      for (const target of targets) {
        doSwap(op, target, content);
      }
    }
  };
};
