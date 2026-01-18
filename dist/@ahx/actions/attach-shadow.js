
import * as log from "@ahx/custom/log/error.js";
import { isElement } from "@ahx/common/guards.js";

export const attachShadow = () => {
  return ({ targets }) => {
    const shadows = [];
    if (targets) {
      for (const target of targets) {
        if (isElement(target) && !target.shadowRoot) {
          try {
            shadows.push(
              target.attachShadow({ mode: "open", serializable: true }),
            );
          } catch (e) {
            log.error("Failed to attachShadow", e);
          }
        }
      }
    }

    return shadows.length
      ? { targets: shadows, init: shadows }
      : { break: true };
  };
};

export default attachShadow;
