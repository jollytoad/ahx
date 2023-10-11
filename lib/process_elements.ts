import { processElement } from "./process_element.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { config } from "./config.ts";
import { asAhxAttributeName } from "./names.ts";

export function processElements(
  root: ParentNode,
) {
  const selectors = new Set<string>();

  [...config.ahxAttrs, ...config.httpMethods].forEach((attr) => {
    selectors.add(`[${asAhxAttributeName(attr)}]`);
  });

  const detail = { selectors };

  if (dispatchBefore(root, "processElements", detail)) {
    const processed = new Set<Node>();

    for (const selector of detail.selectors) {
      if (
        !processed.has(root) && root instanceof Element &&
        root.matches(selector)
      ) {
        processed.add(root);
        processElement(root);
      }
      for (const elt of root.querySelectorAll(selector)) {
        if (!processed.has(elt)) {
          processed.add(elt);
          processElement(elt);
        }
      }
    }

    dispatchAfter(root, "processElements", detail);
  }
}
