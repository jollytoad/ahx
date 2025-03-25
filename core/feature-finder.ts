import type {
  FeatureDetector,
  FeatureFinder,
  LazyFeatureDetector,
} from "@ahx/types";

export async function createFeatureFinder(
  lazyDetectors: LazyFeatureDetector[],
): Promise<FeatureFinder> {
  const detectors = await resolveFns(lazyDetectors);
  const finder: FeatureFinder = function* (things, context) {
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
  lazyFns: LazyFeatureDetector[],
): Promise<FeatureDetector[]> {
  return (await Promise.all(lazyFns)).flatMap((resolved) =>
    typeof resolved === "function"
      ? [resolved as FeatureDetector]
      : resolved && typeof resolved === "object" && "default" in resolved &&
          typeof resolved.default === "function"
      ? [resolved.default as FeatureDetector]
      : []
  );
}
