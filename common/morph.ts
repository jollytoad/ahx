import type { ActionContext } from "@ahx/types";
import { isElement } from "./guards.ts";

/**
 * Get content to morphed into the target.
 */
export async function getMorphContent(
  { nodes, texts, response, initialTarget, control }: ActionContext,
): Promise<string | Node | undefined> {
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
