import { getValueRules } from "../get_value_rules.ts";
import { getInternal, objectsWithInternal } from "../internal.ts";
import { parseTarget } from "../parse_target.ts";
import { querySelectorExt } from "../query_selector.ts";
import { comparePosition } from "./compare_position.ts";

export function forms() {
  console.group("AHX Forms");

  const elements = new Set<Element>();

  for (const [elt] of objectsWithInternal("formData")) {
    if (elt instanceof Element) {
      elements.add(elt);
    }
  }

  for (const rule of getValueRules()) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const targetSpec = parseTarget(elt, rule);
      const target = querySelectorExt(elt, targetSpec?.query);
      if (target) {
        elements.add(target);
      }
    }
  }

  for (const elt of [...elements].sort(comparePosition)) {
    const formData = elt instanceof HTMLFormElement
      ? new FormData(elt)
      : getInternal(elt, "formData");

    if (formData) {
      console.group(elt);

      for (const [name, value] of formData ?? []) {
        console.log("%s: %c%s", name, "font-weight: bold", value);
      }

      console.groupEnd();
    }
  }

  console.groupEnd();
}
