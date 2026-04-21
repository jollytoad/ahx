import type { Context, ReadyFeature } from "@ahx/types";
import { isDocument, isMutationRecord } from "@ahx/common/guards.ts";

export function* ready(
  node: unknown,
  context?: Context,
): Iterable<ReadyFeature> {
  if (isDocument(node) || isMutationRecord(node)) {
    yield {
      kind: "ready",
      context,
      bindings: [["dispatch"]],
      after: true,
    };
  }
}

export default ready;
