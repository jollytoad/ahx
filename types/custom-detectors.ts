import type { LazyFeatureDetector } from "./feature.ts";

/**
 * The expected exports of `@ahx/custom/detectors.ts`
 */
export interface DetectorsModule {
  default: LazyFeatureDetector[];
}
