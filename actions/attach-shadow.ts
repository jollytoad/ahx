import type { ActionConstruct } from "@ahx/types";
import * as log from "@ahx/common/logging.ts";

export const attachShadow: ActionConstruct = () => {
  return ({ targets }) => {
    if (targets) {
      const shadows: ShadowRoot[] = [];

      for (const target of targets) {
        if (target instanceof Element && !target.shadowRoot) {
          try {
            shadows.push(
              target.attachShadow({ mode: "open", serializable: true }),
            );
          } catch (e) {
            log.error("Failed to attachShadow", e);
          }
        }
      }

      return { targets: shadows, init: shadows };
    }
  };
};

export default attachShadow;
