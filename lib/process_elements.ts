import { processElement } from "./process_element.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { config } from "./config.ts";
import { asAhxAttributeName } from "./names.ts";
import { getValueRules } from "./get_value_rules.ts";

export function processElements(root: ParentNode) {
  const selectors = new Set<string>();

  [...config.ahxAttrs, ...config.httpMethods].forEach((attr) => {
    selectors.add(`[${asAhxAttributeName(attr)}]`);
  });

  for (const rule of getValueRules()) {
    selectors.add(rule.selectorText);
  }

  const detail = { selectors };

  if (dispatchBefore(root, "processElements", detail)) {
    for (const selector of detail.selectors) {
      for (const elt of root.querySelectorAll(selector)) {
        processElement(elt);
      }
    }

    dispatchAfter(root, "processElements", detail);
  }
}
