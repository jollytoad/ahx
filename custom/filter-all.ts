import type { Feature } from "@ahx/types/feature.ts";

/**
 * The default binding predicate allows all binding through
 */
function allowBinding(_feature: Feature, _binding: string[]): boolean {
  return true;
}

export default allowBinding;
