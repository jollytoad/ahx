import { isDocument, isShadowRoot } from "./guards.ts";

export function getRoots(nodes: Iterable<Node>): Set<DocumentOrShadowRoot> {
  const roots = new Set<DocumentOrShadowRoot>();
  for (const node of nodes) {
    const root = node.getRootNode();
    if (isDocument(root) || isShadowRoot(root)) {
      roots.add(root);
    }
  }
  return roots;
}
