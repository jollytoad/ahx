

export function* recurseFeature(
  node,
  context,
) {
  if (isRecurseFeature(node)) {
    if (node.context) {
      yield node;
    } else {
      yield {
        context,
        ...node,
      };
    }
  }
}

function isRecurseFeature(node) {
  return (node)?.kind === "recurse" &&
    typeof (node)?.children?.[Symbol.iterator] === "function";
}

export default recurseFeature;
