import type { ActionConstruct } from "@ahx/types";

export const clone: ActionConstruct = () => {
  return ({ nodes }) => {
    if (nodes) {
      return {
        nodes: async function* () {
          for await (const node of nodes) {
            yield node.cloneNode(true);
          }
        }(),
      };
    }
  };
};
