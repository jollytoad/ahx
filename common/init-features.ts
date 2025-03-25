import type {
  Feature,
  FeatureFinder,
  FeatureLoader,
  FeatureOutcome,
} from "@ahx/types";
import * as log from "@ahx/common/logging.ts";

let finder: FeatureFinder | undefined;
let loader: FeatureLoader | undefined;

export async function initFeatures(
  context: unknown,
  things: Iterable<unknown> = [context],
): Promise<void> {
  if (!finder) {
    const { default: detectors } = await import("@ahx/custom/detectors.ts");
    const { createFeatureFinder } = await import("@ahx/core/feature-finder.ts");
    finder = await createFeatureFinder(detectors);
  }

  if (!loader) {
    const { createFeatureLoader } = await import("@ahx/core/feature-loader.ts");
    loader = createFeatureLoader();
  }

  const features = finder(things, context);

  const loading = new Map<Feature, Promise<FeatureOutcome>>();

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
