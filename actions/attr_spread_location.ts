import type { ActionConstruct, ActionResult } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

const DEFAULT_PREFIX = "ahx-location-";
const DEFAULT_PROPS: (keyof Location)[] = [
  "origin",
  "pathname",
  "search",
  "hash",
];

export const attr_spread_location: ActionConstruct = (...args) => {
  let [prefix = DEFAULT_PREFIX, ...props] = args.slice(3);

  if (!props.length) {
    props = DEFAULT_PROPS;
  }

  return ({ targets }): ActionResult | undefined => {
    if (!targets) return;

    for (const target of targets) {
      if (isElement(target)) {
        for (const prop of props) {
          const loc = target.ownerDocument.location;
          const value = loc[prop as keyof Location];
          if (typeof value === "string") {
            if (value) {
              target.setAttribute(prefix + prop, value);
            } else {
              target.removeAttribute(prefix + prop);
            }
          }
        }
      }
    }
  };
};
