

const detectors = [
  import("@ahx/detectors/ahx-ignore.js"),
  import("@ahx/detectors/recurse-feature.js"),
  import("@ahx/detectors/mutation-record.js"),
  import("@ahx/detectors/recurse-document.js"),
  import("@ahx/detectors/observe-html.js"),
  import("@ahx/detectors/observe-shadow-root.js"),
  import("@ahx/detectors/custom-element.js"),
  import("@ahx/detectors/custom-attr.js"),
  import("@ahx/detectors/recurse-shadow-root.js"),
  import("@ahx/detectors/recurse-element.js"),
];

export default detectors;
