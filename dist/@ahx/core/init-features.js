
import * as log from "@ahx/custom/log/feature.js";

let finderPromise;
let loaderPromise;

export async function initFeatures(
  context,
  things = [context],
) {
  if (!finderPromise) {
    finderPromise = (async () => {
      const [{ default: detectors }, { createFeatureFinder }] = await Promise
        .all([
          import("@ahx/custom/detectors.js"),
          import("./feature-finder.js"),
        ]);
      return await createFeatureFinder(detectors);
    })();
  }

  if (!loaderPromise) {
    loaderPromise = (async () => {
      const { createFeatureLoader } = await import("./feature-loader.js");
      return createFeatureLoader();
    })();
  }

  const finder = await finderPromise;
  const features = finder(things, context);

  const loading = new Map();

  const loader = await loaderPromise;
  for (const feature of features) {
    loading.set(feature, loader(feature));
  }

  const promises = [];

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
