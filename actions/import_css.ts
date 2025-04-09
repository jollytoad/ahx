import type { ActionConstruct, ActionResult } from "@ahx/types";

export const import_css: ActionConstruct = (_op, url) => {
  if (!url) {
    throw new TypeError("A URL for a stylesheet is required");
  }

  return ({ targets }): ActionResult | void => {
    if (!targets?.length) return;

    for (const target of targets) {
      if (target.ownerDocument) {
        const el = target.ownerDocument.createElement("link");
        el.setAttribute("rel", "stylesheet");
        el.setAttribute("href", url);
        target.appendChild(el);
      }
    }
  };
};
