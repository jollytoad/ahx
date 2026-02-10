

export const clone = () => {
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
