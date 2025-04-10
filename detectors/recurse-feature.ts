import type { Context, RecurseFeature } from "@ahx/types";

export function* recurseFeature(
  node: unknown,
  context?: Context,
): Iterable<RecurseFeature> {
  if (isRecurseFeature(node)) {
    if (node.context) {
      yield node;
    } else {
      yield {
        context,
        ...node,
      };
    }
  }
}

function isRecurseFeature(node: unknown): node is RecurseFeature {
  return (node as RecurseFeature)?.kind === "recurse" &&
    typeof (node as RecurseFeature)?.children?.[Symbol.iterator] === "function";
}

export default recurseFeature;
