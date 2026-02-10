
import { isDocument } from "@ahx/common/guards.js";

export function* recurseDocument(
  node,
  _context,
) {
  if (isDocument(node)) {
    yield {
      kind: "recurse",
      context: document,
      children: [node.documentElement],
    };
  }
}

export default recurseDocument;
