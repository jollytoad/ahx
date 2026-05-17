import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export const as_text: ActionConstruct = () => {
  return async (
    { texts, nodes, response, initialTarget },
  ): Promise<ActionResult | undefined> => {
    if (!texts && !nodes && response) {
      texts = [await response.text()];
    }

    if (!nodes && !texts && isElement(initialTarget)) {
      nodes = [initialTarget];
    }

    if (nodes) {
      texts = [];
      for await (const node of nodes) {
        const text = node.textContent;
        if (text) {
          texts?.push(text);
        }
      }
      if (texts.length) {
        return { texts, nodes: undefined, response: undefined };
      }
    }

    return { texts, nodes: undefined, response: undefined };
  };
};
