import type { Context, ElementFeature } from "@ahx/types";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";

export function* customElementDetector(
  node: unknown,
  context?: Context,
): Iterable<ElementFeature> {
  if (node instanceof Element && node.localName.includes("-")) {
    yield {
      kind: "element",
      context,
      element: node,
      name: node.localName,
      bindings: potentialBindings(node.localName.split("-")),
    };
  }
}

export default customElementDetector;
