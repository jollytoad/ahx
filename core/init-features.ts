import type {
  Feature,
  FeatureFinder,
  FeatureLoader,
  FeatureOutcome,
} from "@ahx/types";
import { featureOutcome } from "@ahx/custom/log/feature.ts";

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
      const [
        { default: allowBinding },
        { bindingOutcome },
        { createFeatureLoader },
      ] = await Promise
        .all([
          import("@ahx/custom/filter.ts"),
          import("@ahx/custom/log/binding.ts"),
          import("./feature-loader.ts"),
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
