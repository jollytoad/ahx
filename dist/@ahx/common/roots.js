import { isDocument, isShadowRoot } from "./guards.js";

export function getRoots(nodes) {
  const roots = new Set();
  for (const node of nodes) {
    const root = node.getRootNode();
    if (isDocument(root) || isShadowRoot(root)) {
      roots.add(root);
    }
  }
  return roots;
}
