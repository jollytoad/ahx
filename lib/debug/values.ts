import { findTarget } from "../find_target.ts";
import { getInternal, objectsWithInternal } from "../internal.ts";
import { parseInput } from "../parse_input.ts";

export function values() {
  console.group("AHX Values");

  for (const [rule] of objectsWithInternal("valueSource")) {
    if (rule instanceof CSSStyleRule) {
      console.group(rule.cssText);
      for (const elt of document.querySelectorAll(rule.selectorText)) {
        const form = findTarget(elt);
        const inputName = parseInput(elt);

        if (form && inputName) {
          console.log(
            "%o -> %c%s%c -> %o %s",
            elt,
            "font-weight: bold",
            getInternal(elt, "value"),
            "font-weight: normal",
            form,
            inputName,
          );
        }
      }
      console.groupEnd();
    }
  }

  console.groupEnd();
}
