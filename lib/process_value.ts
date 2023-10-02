import type { AhxCSSPropertyName } from "./types.ts";
import { asAhxCSSPropertyName } from "./names.ts";
import { getAhxCssValue } from "./get_ahx_value.ts";
import { getInternal, objectsWithInternal, setInternal } from "./internal.ts";
import { resolveElement } from "./resolve_element.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { findTarget } from "./find_target.ts";
import { parseInput } from "./parse_input.ts";
import { updateForm } from "./update_form.ts";

export function processValueSource(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName>,
) {
  if (props.has(asAhxCSSPropertyName("value"))) {
    setInternal(rule, "valueSource", true);

    const document = resolveElement(rule)?.ownerDocument;
    if (document) {
      processValues(document);
    }
  }
}

export function processValues(root: ParentNode) {
  const valueRules = objectsWithInternal("valueSource");

  for (const [rule] of valueRules) {
    if (rule instanceof CSSStyleRule) {
      for (const elt of root.querySelectorAll(rule.selectorText)) {
        processValue(elt);
      }
    }
  }
}

export function processValue(elt: Element) {
  const newValue = getAhxCssValue(elt, "value");
  if (newValue) {
    const oldValue = getInternal(elt, "value");

    const detail = {
      target: findTarget(elt),
      inputName: parseInput(elt),
      oldValue,
      newValue,
    };

    if (newValue !== oldValue) {
      if (dispatchBefore(elt, "processValue", detail)) {
        const { target, inputName, newValue } = detail;

        setInternal(elt, "value", newValue);

        if (target && inputName) {
          updateForm(target, inputName, newValue);
        }

        dispatchAfter(elt, "processValue", detail);
      }
    }
  }
}
