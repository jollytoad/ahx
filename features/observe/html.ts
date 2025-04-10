import type { ObserveFeature } from "@ahx/types";
import { startDOMObserver } from "@ahx/core/start-dom-observer.ts";

export default function ({ context, node }: ObserveFeature): void {
  startDOMObserver(context, node);
}
