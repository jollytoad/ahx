import type {
  Awaitable,
  Feature,
  FeatureLoader,
  FeatureOutcome,
} from "@ahx/types";

export async function* loadConcurrently<
  F extends Feature = Feature,
  V = unknown,
>(
  lazyLoader: Awaitable<FeatureLoader<F, V>>,
  features: Iterable<F>,
): AsyncIterable<FeatureOutcome<F, V>> {
  const loader = await lazyLoader;
  const loading = new Map<F, Promise<FeatureOutcome<F, V>>>();

  for (const feature of features) {
    loading.set(feature, loader(feature));
  }

  while (loading.size) {
    const outcome = await Promise.race(loading.values());
    loading.delete(outcome.feature);
    yield outcome;
  }
}
