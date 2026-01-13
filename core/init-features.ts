import type {
  Feature,
  FeatureFinder,
  FeatureLoader,
  FeatureOutcome,
} from "@ahx/types";
import * as log from "@ahx/custom/log/feature.ts";

let finderPromise: Promise<FeatureFinder> | undefined;
let loaderPromise: Promise<FeatureLoader> | undefined;

export async function initFeatures(
  context: unknown,
  things: Iterable<unknown> = [context],
): Promise<void> {
  if (!finderPromise) {
    finderPromise = (async () => {
      const [{ default: detectors }, { createFeatureFinder }] = await Promise
        .all([
          import("@ahx/custom/detectors.ts"),
          import("./feature-finder.ts"),
        ]);
      return await createFeatureFinder(detectors);
    })();
  }

  if (!loaderPromise) {
    loaderPromise = (async () => {
      const { createFeatureLoader } = await import("./feature-loader.ts");
      return createFeatureLoader();
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

    if ("exportValue" in outcome && outcome.exportValue) {
      log.importFeature(outcome);
      promises.push(outcome.exportValue(outcome.feature));
    }
  }

  await Promise.allSettled(promises);
}
