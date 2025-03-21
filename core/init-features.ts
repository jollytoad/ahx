import type { Awaitable, Feature, FeatureLoader } from "@ahx/types";
import { loadConcurrently } from "./load-concurrently.ts";

export async function initFeatures(
  lazyLoader: Awaitable<FeatureLoader>,
  features: Iterable<Feature>,
): Promise<void> {
  const promises: unknown[] = [];
  for await (const outcome of loadConcurrently(lazyLoader, features)) {
    if ("exportValue" in outcome && outcome.exportValue) {
      promises.push(outcome.exportValue(outcome.feature));
    }
  }
  await Promise.allSettled(promises);
}
