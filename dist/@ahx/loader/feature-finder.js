

export async function createFeatureFinder(
  lazyDetectors,
) {
  const detectors = await resolveFns(lazyDetectors);
  const finder = function* (things, context) {
    nextThing:
    for (const thing of things) {
      for (const detector of detectors) {
        for (const feature of detector(thing, context)) {
          if (feature.ignore) continue nextThing;
          yield feature;
          if (feature.children) {
            yield* finder(feature.children, feature.context ?? context);
          }
        }
      }
    }
  };
  return finder;
}

async function resolveFns(
  lazyFns,
) {
  return (await Promise.all(lazyFns)).flatMap((resolved) =>
    typeof resolved === "function"
      ? [resolved]
      : resolved && typeof resolved === "object" && "default" in resolved &&
          typeof resolved.default === "function"
      ? [resolved.default]
      : []
  );
}
