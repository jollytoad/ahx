import type { ObserveFeature } from "@ahx/types";
import { startDOMObserver } from "@ahx/core/start-dom-observer.ts";
import { isNode } from "@ahx/common/guards.ts";

export default function (feature: ObserveFeature): void {
  if (isNode(feature.context)) {
    startDOMObserver(feature.context);
  }
}
