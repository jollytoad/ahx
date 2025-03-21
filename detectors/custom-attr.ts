import type { AttrFeature, Context } from "@ahx/types";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";

export function* customAttrDetector(
  node: unknown,
  context?: Context,
): Iterable<AttrFeature> {
  if (node instanceof Element && node.hasAttributes()) {
    for (const attr of node.attributes) {
      if (attr.name.includes("-")) {
        yield {
          kind: "attr",
          context,
          attr,
          element: node,
          name: attr.name,
          value: attr.value,
          bindings: potentialBindings(attr.name.split("-")),
        };
      }
    }
  }
}

export default customAttrDetector;
