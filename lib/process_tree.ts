import { processElement } from "./process_element.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { config } from "./config.ts";
import { asAhxAttributeName } from "./names.ts";

export function processTree(root: ParentNode, selector = defaultSelector()) {
  // Maybe selector should combine all value rules too?

  const detail = { selector };

  if (dispatchBefore(root, "processTree", detail)) {
    const elements = root.querySelectorAll(detail.selector);

    for (const elt of elements) {
      processElement(elt);
    }

    dispatchAfter(root, "processTree", detail);
  }
}

export function defaultSelector() {
  return [...config.ahxAttrs, ...config.httpMethods].map((attr) =>
    `[${asAhxAttributeName(attr)}]`
  ).join(",");
}
