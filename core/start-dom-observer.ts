import { initFeatures } from "@ahx/common/init-features.ts";

const cache = new WeakMap<Node, MutationObserver>();

export function startDOMObserver(
  root: Node,
): MutationObserver {
  let observer = cache.get(root);

  if (!observer) {
    observer = new MutationObserver((mutations) => {
      initFeatures(root, mutations);
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });

    cache.set(root, observer);
  }

  return observer;
}
