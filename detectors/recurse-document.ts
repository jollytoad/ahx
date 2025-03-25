import type { Context, RecurseFeature } from "@ahx/types";

export function* recurseDocument(
  node: unknown,
  _context?: Context,
): Iterable<RecurseFeature> {
  if (node instanceof Document) {
    yield {
      kind: "recurse",
      context: document.body,
      children: [document.documentElement],
    };
  }
}

export default recurseDocument;
