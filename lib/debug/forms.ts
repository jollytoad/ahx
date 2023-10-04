import { getInternal, objectsWithInternal } from "../internal.ts";
import { parseCssValue } from "../parse_css_value.ts";
import { getValueRules } from "../process_value.ts";
import { querySelectorExt } from "../query_selector.ts";
import { comparePosition } from "./compare_position.ts";

export function forms() {
  console.group("AHX Forms");

  const forms = new Set<Element>();

  for (const [form] of objectsWithInternal("formData")) {
    if (form instanceof Element) {
      forms.add(form);
    }
  }

  for (const rule of getValueRules()) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const query = parseCssValue({ elt, rule, prop: "form" }).value;
      const form = querySelectorExt(elt, query);
      if (form) {
        forms.add(form);
      }
    }
  }

  for (const form of [...forms].sort(comparePosition)) {
    console.group(form);

    const formData = form instanceof HTMLFormElement
      ? new FormData(form)
      : getInternal(form, "formData");

    for (const [name, value] of formData ?? []) {
      console.log("%s: %c%s", name, "font-weight: bold", value);
    }

    console.groupEnd();
  }

  console.groupEnd();
}
