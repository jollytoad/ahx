import { initFeatures } from "./init-features.ts";

const cache = new WeakMap<Node, MutationObserver>();

export function startDOMObserver(
  context: unknown,
  observationRoot: Node,
): MutationObserver {
  let observer = cache.get(observationRoot);

  if (!observer) {
    observer = new MutationObserver((mutations) => {
      initFeatures(context, mutations);
    });

    observer.observe(observationRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });

    cache.set(observationRoot, observer);
  }

  return observer;
}
