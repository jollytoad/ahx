
import { isElement } from "@ahx/common/guards.js";

export async function getMorphContent(
  { nodes, texts, response, initialTarget, control },
) {
  if (!nodes && !texts && response) {
    return await response.text();
  }

  if (
    !nodes && !texts && isElement(initialTarget) &&
    initialTarget !== control.root
  ) {
    return initialTarget;
  }

  if (nodes) {
    for await (const node of nodes) {
      return node;
    }
  } else if (texts?.length) {
    return texts[0];
  }
}
