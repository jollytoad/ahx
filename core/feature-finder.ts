import type { Awaitable, FeatureDetector, FeatureFinder } from "@ahx/types";

export async function createFeatureFinder(
  ...lazyDetectors: LazyFn<FeatureDetector>[]
): Promise<FeatureFinder> {
  const detectors = await resolveFns<FeatureDetector>(lazyDetectors);
  const finder: FeatureFinder = function* (things, context) {
    for (const thing of things) {
      for (const detector of detectors) {
        for (const feature of detector(thing, context)) {
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

type LazyFn<F> = Awaitable<F | { default?: F } | undefined>;

// deno-lint-ignore ban-types
async function resolveFns<F extends Function>(
  lazyFns: LazyFn<F>[],
): Promise<F[]> {
  return (await Promise.all(lazyFns)).flatMap((resolved) =>
    typeof resolved === "function"
      ? [resolved as F]
      : resolved && typeof resolved === "object" && "default" in resolved &&
          typeof resolved.default === "function"
      ? [resolved.default as F]
      : []
  );
}
