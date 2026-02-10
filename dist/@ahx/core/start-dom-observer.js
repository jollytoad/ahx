import { initFeatures } from "./init-features.js";

const cache = new WeakMap();

export function startDOMObserver(
  context,
  observationRoot,
) {
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
