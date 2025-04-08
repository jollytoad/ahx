import type { Context, RecurseFeature } from "@ahx/types";
import { isDocument } from "@ahx/common/guards.ts";

export function* recurseDocument(
  node: unknown,
  _context?: Context,
): Iterable<RecurseFeature> {
  if (isDocument(node)) {
    yield {
      kind: "recurse",
      context: node.body,
      children: [node.documentElement],
    };
  }
}

export default recurseDocument;
