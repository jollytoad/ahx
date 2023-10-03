import type { AhxCSSPropertyName, Owner, ProcessValueDetail } from "./types.ts";
import { asAhxCSSPropertyName } from "./names.ts";
import { findMatchingRules, getAhxCssValue } from "./get_ahx_value.ts";
import { getInternal, objectsWithInternal, setInternal } from "./internal.ts";
import { resolveElement } from "./resolve_element.ts";
import { dispatchAfter, dispatchBefore, dispatchError } from "./dispatch.ts";
import { findTarget } from "./find_target.ts";
import { parseInput } from "./parse_input.ts";
import { updateForm } from "./update_form.ts";
import { getOwner } from "./owner.ts";

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
    const target = findTarget(elt);

    const detail: ProcessValueDetail = {
      target,
      inputName: parseInput(elt),
      oldValue,
      newValue,
      sourceOwner: getOwner(elt),
      targetOwner: target ? getOwner(target) : undefined,
    };

    if (newValue !== oldValue) {
      const owners = getRuleOwners(elt, newValue);

      if (owners.size > 1) {
        dispatchError(elt, "multipleValueRuleOwners", { owners });
        return;
      }

      detail.ruleOwner = [...owners][0];

      if (dispatchBefore(elt, "processValue", detail)) {
        const { target, inputName, newValue } = detail;

        setInternal(elt, "value", newValue);

        if (target && inputName) {
          updateForm({
            target,
            inputName,
            ...detail,
          });
        }

        dispatchAfter(elt, "processValue", detail);
      }
    }
  }
}

function getRuleOwners(elt: Element, expectedValue: string): Set<Owner> {
  const owners = new Set<Owner>();
  const matches = findMatchingRules(elt, "valueSource", "value");
  for (const m of matches) {
    if (m.rule && m.value === expectedValue) {
      const owner = getOwner(m.rule);
      if (owner) {
        owners.add(owner);
      }
    }
  }
  return owners;
}
