import { querySelectorExt } from "../query_selector.ts";
import { getInternal } from "../internal.ts";
import { parseInput } from "../parse_input.ts";
import { getValueRules } from "../process_value.ts";
import { parseCssValue } from "../parse_css_value.ts";

export function values() {
  console.group("AHX Values");

  for (const rule of getValueRules()) {
    console.group(rule.cssText);
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const query = parseCssValue({ elt, rule, prop: "form" }).value;
      const form = querySelectorExt(elt, query);
      const spec = parseInput(elt);

      if (form && spec) {
        const { inputName, inputModifier, inputSeparator } = spec;

        console.log(
          "%o -> %c%s%c -> %o %s.%s%s",
          elt,
          "font-weight: bold",
          getInternal(elt, "value"),
          "font-weight: normal",
          form,
          inputName,
          inputModifier,
          inputSeparator ? `("${inputSeparator}")` : "",
        );
      }
    }
    console.groupEnd();
  }

  console.groupEnd();
}
