import type { ActionConstruct } from "@ahx/types";
import { initFeatures } from "@ahx/common/init-features.ts";
import * as log from "@ahx/common/logging.ts";

export const attachShadow: ActionConstruct = () => {
  return async ({ targets }) => {
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

      await Promise.all(shadows.map((shadow) => initFeatures(shadow)));

      return { targets: shadows };
    }
  };
};

export default attachShadow;
