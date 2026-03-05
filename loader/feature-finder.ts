import type {
  FeatureDetector,
  FeatureFinder,
  LazyFeatureDetector,
} from "@ahx/types";

/**
 * Create a function that finds potential {@link Feature}s in a generally hierarchical
 * structure, for example a DOM.
 *
 * @param lazyDetectors Array of feature detectors (functions or modules with default export,
 *   and may be a Promise)
 * @returns A {@link FeatureFinder} iterates over the given _things_, applying each
 *   {@link FeatureDetector} function, which may yield interesting {@link Feature}s.
 *
 * @example
 * ```ts
 * import { createFeatureFinder } from "@ahx/loader/feature-finder.ts";
 * import detectors from "@ahx/custom/detectors.ts";
 *
 * const finder = await createFeatureFinder(detectors);
 *
 * const features = await finder(document);
 * ```
 */
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
