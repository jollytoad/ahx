import type { Context, RecurseFeature } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export function* recurseElement(
  node: unknown,
  context?: Context,
): Iterable<RecurseFeature> {
  if (isElement(node)) {
    yield {
      kind: "recurse",
      context,
      children: node.childNodes,
    };
  }
}

export default recurseElement;
