import type { LazyFeatureDetector } from "@ahx/types";

const detectors: LazyFeatureDetector[] = [
  import("@ahx/detectors/ahx-ignore.ts"),
  import("@ahx/detectors/recurse-feature.ts"),
  import("@ahx/detectors/mutation-record.ts"),
  import("@ahx/detectors/recurse-document.ts"),
  import("@ahx/detectors/observe-html.ts"),
  import("@ahx/detectors/observe-shadow-root.ts"),
  import("@ahx/detectors/custom-element.ts"),
  import("@ahx/detectors/custom-attr.ts"),
  import("@ahx/detectors/recurse-shadow-root.ts"),
  import("@ahx/detectors/recurse-element.ts"),
];

export default detectors;
