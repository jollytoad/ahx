
import { isElement } from "@ahx/common/guards.js";

export function* recurseElement(
  node,
  context,
) {
  if (isElement(node)) {
    yield {
      kind: "recurse",
      context,
      children: node.childNodes,
    };
  }
}

export default recurseElement;
