import type { Awaitable, FeatureFinder, FeatureLoader } from "@ahx/types";

const cache = new WeakMap<Node, MutationObserver>();

export function startDOMObserver(
  root: ParentNode,
  lazyFinder: Awaitable<FeatureFinder>,
  lazyLoader: Awaitable<FeatureLoader>,
): MutationObserver {
  let observer = cache.get(root);

  if (!observer) {
    observer = new MutationObserver(async (mutations) => {
      const [finder, loader, { initFeatures }] = await Promise.all([
        lazyFinder,
        lazyLoader,
        import("./init-features.ts"),
      ]);
      initFeatures(loader, finder(mutations, root));
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
