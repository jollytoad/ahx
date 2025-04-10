import type { ActionConstruct, ActionResult, RecurseFeature } from "@ahx/types";
import { getRoots } from "@ahx/common/roots.ts";

export const import_css: ActionConstruct = (_op, url) => {
  if (!url) {
    throw new TypeError("A URL for a stylesheet is required");
  }

  return async ({ targets }): Promise<ActionResult | void> => {
    if (!targets?.length) return;

    const sheet = (await import(url, { with: { type: "css" } })).default;

    const init: RecurseFeature[] = [];

    for (const root of getRoots(targets)) {
      if (!root.adoptedStyleSheets.includes(sheet)) {
        root.adoptedStyleSheets.push(sheet);
        init.push(sheet);
      }
    }

    return { init };
  };
};
