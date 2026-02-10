import ahxIgnoreDetector from "@ahx/detectors/ahx-ignore.js";
import recurseDocument from "@ahx/detectors/recurse-document.js";
import recurseShadowRoot from "@ahx/detectors/recurse-shadow-root.js";
import recurseElement from "@ahx/detectors/recurse-element.js";
import onReadyAttrDetector from "./detectors/on-ready-attr.js";

export default [
  ahxIgnoreDetector,
  recurseDocument,
  onReadyAttrDetector,
  recurseShadowRoot,
  recurseElement,
];
