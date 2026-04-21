
import { isDocument, isMutationRecord } from "@ahx/common/guards.js";

export function* ready(
  node,
  context,
) {
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
