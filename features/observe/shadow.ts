import type { ObserveFeature } from "@ahx/types";
import { startDOMObserver } from "@ahx/core/start-dom-observer.ts";

export default function (feature: ObserveFeature): void {
  if (feature.context instanceof Node) {
    startDOMObserver(feature.context);
  }
}
