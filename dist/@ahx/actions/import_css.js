
import { getRoots } from "@ahx/common/roots.js";

export const import_css = (_op, url) => {
  if (!url) {
    throw new TypeError("A URL for a stylesheet is required");
  }

  return async ({ targets }) => {
    if (!targets?.length) return;

    const sheet = (await import(url, { with: { type: "css" } })).default;

    const init = [];

    for (const root of getRoots(targets)) {
      if (!root.adoptedStyleSheets.includes(sheet)) {
        root.adoptedStyleSheets.push(sheet);
        init.push(sheet);
      }
    }

    return { init };
  };
};
