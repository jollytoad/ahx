import { querySelectorExt } from "../query_selector.ts";
import { getInternal } from "../internal.ts";
import { parseTarget } from "../parse_target.ts";
import { getValueRules } from "../get_value_rules.ts";

export function values() {
  console.group("AHX Value mapping");

  for (const rule of getValueRules()) {
    console.group(rule.cssText);

    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const value = getInternal(elt, "values")?.get(rule);
      const spec = parseTarget(elt, rule);

      if (spec) {
        const { query, type, name, modifier, separator } = spec;

        const target = querySelectorExt(elt, query);

        console.log(
          "%o -> %c%s%c -> %o %s:%s.%s%s",
          elt,
          "font-weight: bold",
          value,
          "font-weight: normal",
          target === elt ? "this" : target,
          type,
          name,
          modifier ?? "default",
          separator ? `("${separator}")` : "",
        );
      } else {
        console.log(
          "%o -> %c%s",
          elt,
          "font-weight: bold",
          value,
        );
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
}
