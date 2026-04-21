
import { getRules } from "@ahx/common/controls.js";
import { dispatchReady } from "@ahx/core/ready.js";

export default function (_feature) {
  for (const control of getRules("ready")) {
    dispatchReady(control);
  }
}
