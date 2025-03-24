/**
 * Start the observer and find all hypermedia controls.
 */
export async function start(
  root?: ParentNode,
  head?: ParentNode,
): Promise<void> {
  const lazyLoader = loader();

  if (root) {
    const { startDOMObserver } = await import("./start-dom-observer.ts");
    startDOMObserver(root, observerFinder(), lazyLoader);
  }

  const headFeatures = head
    ? (await headFinder())(head.children, root ?? head)
    : [];
  const bodyFeatures = root ? (await bodyFinder())([root], root) : [];

  const { initFeatures } = await import("./init-features.ts");
  await initFeatures(lazyLoader, headFeatures);
  await initFeatures(lazyLoader, bodyFeatures);
}

async function headFinder() {
  return (await import("./feature-finder.ts")).createFeatureFinder(
    import("@ahx/detectors/ahx-ignore.ts"),
    import("@ahx/detectors/custom-css-property.ts"),
    import("@ahx/detectors/recurse-css-rules.ts"),
  );
}

async function bodyFinder() {
  return (await import("./feature-finder.ts")).createFeatureFinder(
    import("@ahx/detectors/ahx-ignore.ts"),
    import("@ahx/detectors/custom-element.ts"),
    import("@ahx/detectors/custom-attr.ts"),
    import("@ahx/detectors/custom-css-property.ts"),
    import("@ahx/detectors/recurse-css-rules.ts"),
    import("@ahx/detectors/recurse-shadow-root.ts"),
    import("@ahx/detectors/recurse-element.ts"),
  );
}

async function observerFinder() {
  return (await import("./feature-finder.ts")).createFeatureFinder(
    import("@ahx/detectors/ahx-ignore.ts"),
    import("@ahx/detectors/mutation-record.ts"),
    import("@ahx/detectors/custom-element.ts"),
    import("@ahx/detectors/custom-attr.ts"),
    import("@ahx/detectors/recurse-shadow-root.ts"),
    import("@ahx/detectors/recurse-element.ts"),
  );
}

async function loader() {
  return (await import("./feature-loader.ts")).createFeatureLoader();
}
