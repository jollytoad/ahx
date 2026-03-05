import type {
  Feature,
  FeatureFinder,
  FeatureLoader,
  FeatureOutcome,
} from "@ahx/types";
import { featureOutcome } from "@ahx/custom/log/feature.ts";

let finderPromise: Promise<FeatureFinder> | undefined;
let loaderPromise: Promise<FeatureLoader> | undefined;

/**
 * Find, load and initialize {@link Feature}s with the given set of _things_.
 *
 * Using the set of {@link FeatureDetector}s provided by the `@ahx/custom/detectors.ts` module
 * (default export), and with the filter from `@ahx/custom/filter.ts` (default export).
 *
 * The outcome of each feature binding is passed to the {@link bindingOutcome} function
 * from `@ahx/custom/log/binding.ts`.
 *
 * The expected way to customize these is to remap those `@ahx/custom/*` module specifiers to
 * your own modules or to one of the provided alternatives.
 *
 * @param context Some contextual object for the detectors and the Features, usually a root of a tree
 * @param things The set of things to find Features within, defaults to just the context object if not given
 */
export async function initFeatures(
  context: unknown,
  things: Iterable<unknown> = [context],
): Promise<void> {
  if (!finderPromise) {
    finderPromise = (async () => {
      const [{ default: detectors }, { createFeatureFinder }] = await Promise
        .all([
          import("@ahx/custom/detectors.ts"),
          import("@ahx/loader/feature-finder.ts"),
        ]);
      return await createFeatureFinder(detectors);
    })();
  }

  if (!loaderPromise) {
    loaderPromise = (async () => {
      const [
        { default: allowBinding },
        { bindingOutcome },
        { createFeatureLoader },
      ] = await Promise
        .all([
          import("@ahx/custom/filter.ts"),
          import("@ahx/custom/log/binding.ts"),
          import("@ahx/loader/feature-loader.ts"),
        ]);
      return createFeatureLoader({
        allowBinding,
        logBinding: (outcome) => bindingOutcome(outcome, " "),
      });
    })();
  }

  const finder = await finderPromise;
  const features = finder(things, context);

  const loading = new Map<Feature, Promise<FeatureOutcome>>();

  const loader = await loaderPromise;
  for (const feature of features) {
    loading.set(feature, loader(feature));
  }

  const promises: unknown[] = [];

  while (loading.size) {
    const outcome = await Promise.race(loading.values());
    loading.delete(outcome.feature);

    featureOutcome(outcome, " ");

    if (outcome.status === "loaded") {
      promises.push(outcome.exportValue(outcome.feature));
    }
  }

  await Promise.allSettled(promises);
}
