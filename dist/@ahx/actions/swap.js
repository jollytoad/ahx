
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

    if (isAsyncIterable(nodes)) {
                        
            const cursors = [...swapToTargets(op, targets, createCursorNode)];

      for await (const node of nodes) {
                for (const _ of swapToTargets("before", cursors, clonesOf(node))) {
          // ignore the swapped node
        }
      }
    } else if (nodes) {
                  
      let effectiveOp = op;

      for (const node of nodes) {
                        targets = [...swapToTargets(effectiveOp, targets, clonesOf(node))];

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

function isAsyncIterable(nodes) {
  return !!nodes && Symbol.asyncIterator in nodes &&
    typeof nodes[Symbol.asyncIterator] === "function";
}

function* swapToTargets(
  op,
  targets,
  source,
) {
  for (const target of targets) {
    const node = source(target);
    if (node) {
      doSwap(op, target, node);
      yield node;
    }
  }
}

function createCursorNode(target) {
  return target.ownerDocument?.createTextNode("");
}

function clonesOf(node) {
  let clone = false;
  return () => {
    try {
      return clone ? node.cloneNode(true) : node;
    } finally {
      clone = true;
    }
  };
}
