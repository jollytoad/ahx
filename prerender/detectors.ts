import ahxIgnoreDetector from "@ahx/detectors/ahx-ignore.ts";
import recurseDocument from "@ahx/detectors/recurse-document.ts";
import recurseShadowRoot from "@ahx/detectors/recurse-shadow-root.ts";
import recurseElement from "@ahx/detectors/recurse-element.ts";
import onReadyAttrDetector from "./detectors/on-ready-attr.ts";

export default [
  ahxIgnoreDetector,
  recurseDocument,
  onReadyAttrDetector,
  recurseShadowRoot,
  recurseElement,
];
