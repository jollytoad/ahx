import type { Context, RecurseFeature } from "@ahx/types";

export function* recurseElement(
  node: unknown,
  context?: Context,
): Iterable<RecurseFeature> {
  if (node instanceof Element) {
    yield {
      kind: "recurse",
      context,
      children: node.childNodes,
    };
  }
}

export default recurseElement;
