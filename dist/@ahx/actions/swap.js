
import { swap as doSwap,} from "@ahx/common/swap.js";
import { isElement } from "@ahx/common/guards.js";

export const swap = (...args) => {
  const op = args[0] ?? "inner";

  return async (
    { targets, texts, nodes, response, initialTarget, control },
  ) => {
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
        const tails = [];

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

                targets = tails;
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
