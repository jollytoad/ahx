import type { ReadyFeature } from "@ahx/types";
import { getRules } from "@ahx/common/controls.ts";
import { dispatchReady } from "@ahx/core/ready.ts";

export default function (_feature: ReadyFeature): void {
  for (const control of getRules("ready")) {
    dispatchReady(control);
  }
}
