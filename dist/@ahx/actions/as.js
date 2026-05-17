
import { isElement } from "@ahx/common/guards.js";

export const as_text = () => {
  return async (
    { texts, nodes, response, initialTarget },
  ) => {
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
