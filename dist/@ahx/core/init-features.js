
import { featureOutcome } from "@ahx/custom/log/feature.js";

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
          import("@ahx/loader/feature-finder.js"),
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
          import("@ahx/custom/filter.js"),
          import("@ahx/custom/log/binding.js"),
          import("@ahx/loader/feature-loader.js"),
        ]);
      return createFeatureLoader({
        allowBinding,
        logBinding: (outcome) => bindingOutcome(outcome, " "),
      });
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

  const after = [];

  while (loading.size) {
    const outcome = await Promise.race(loading.values());
    loading.delete(outcome.feature);

    featureOutcome(outcome, " ");

    if (outcome.status === "loaded") {
      if (outcome.feature.after) {
                after.push(outcome);
      } else {
                        promises.push(outcome.exportValue(outcome.feature));
      }
    }
  }

  await Promise.allSettled(promises);

  if (after.length) {
    await Promise.allSettled(
      after.map((outcome) => outcome.exportValue(outcome.feature)),
    );
  }
}
