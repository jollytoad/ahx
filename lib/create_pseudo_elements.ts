import { config } from "./config.ts";
import { processStyleRule } from "./process_style_rule.ts";
import {
  triggerAfterEvent,
  triggerBeforeEvent,
  triggerErrorEvent,
} from "./trigger_event.ts";
import type { PseudoId, PseudoPlace } from "./types.ts";

const pseudoIds = new WeakMap<CSSStyleRule, PseudoId>();

let nextPseudoId = 1;

export function createPseudoElements(rule: CSSStyleRule): boolean {
  // TODO: better selectorText parsing
  const before = rule.selectorText.includes("::before");
  const after = before ? false : rule.selectorText.includes("::after");

  let modified = false;

  if (before || after) {
    const pseudoId = pseudoIds.get(rule) || nextPseudoId++;
    const place = before ? "before" : "after";
    const parentSelector = rule.selectorText.replace(`::${place}`, "");

    for (const elt of document.querySelectorAll(parentSelector)) {
      // Insert a 'pseudo-element'
      if (createPseudoElement(elt, pseudoId, place)) {
        modified = true;
      }
    }

    if (createPseudoRule(rule, pseudoId, place)) {
      modified = true;
    }
  }

  return modified;
}

function createPseudoElement(
  elt: Element,
  pseudoId: PseudoId,
  place: PseudoPlace,
) {
  const pseudoIdClass = `${config.prefix}-pseudo-${pseudoId}`;

  if (!elt.querySelector(`:scope > .${pseudoIdClass}`)) {
    const parentTag = elt.localName;

    // TODO: Pick appropriate tag for other types of parent too
    let pseudoTag = config.pseudoChildTags[parentTag];

    if (pseudoTag === null) {
      triggerErrorEvent(elt, "pseudoElementNotPermitted", { parentTag });
      return;
    }

    if (pseudoTag === undefined) {
      pseudoTag = config.pseudoChildTags["*"] ?? "span";
    }

    const placeClass = `${config.prefix}-pseudo-${place}`;

    const pseudoElt = document.createElement(pseudoTag);
    pseudoElt.setAttribute(
      "class",
      `${config.prefix}-pseudo ${placeClass} ${pseudoIdClass}`,
    );

    const detail = {
      pseudoElt,
      pseudoId,
      place,
    };

    if (triggerBeforeEvent(elt, "pseudoElement", detail)) {
      const insertPosition = detail.place === "before"
        ? "afterbegin"
        : "beforeend";
      elt.insertAdjacentElement(insertPosition, detail.pseudoElt);
      triggerAfterEvent(elt, "pseudoElement", detail);
      return true;
    }
  }
  return false;
}

function createPseudoRule(
  rule: CSSStyleRule,
  pseudoId: PseudoId,
  place: PseudoPlace,
) {
  if (!pseudoIds.has(rule)) {
    // Create a 'pseudo-rule' to target the 'pseudo-element'
    pseudoIds.set(rule, pseudoId);

    const pseudoIdClass = `${config.prefix}-pseudo-${pseudoId}`;

    const selectorText = rule.selectorText.replace(
      `::${place}`,
      ` > .${pseudoIdClass}`,
    );
    const cssText = rule.cssText.replace(rule.selectorText, selectorText);
    const pseudoRule = {
      selectorText,
      cssText,
      parentStyleSheet: rule.parentStyleSheet,
    };

    const detail = {
      pseudoId,
      pseudoRule,
      rule,
      place,
    };

    if (triggerBeforeEvent(document, "pseudoRule", detail)) {
      const styleSheet = detail.pseudoRule.parentStyleSheet;
      if (styleSheet) {
        const cssRules = styleSheet.cssRules;

        const pseudoRule = cssRules[
          styleSheet.insertRule(detail.pseudoRule.cssText, cssRules.length)
        ] as CSSStyleRule;

        const addedRules = processStyleRule(pseudoRule);

        triggerAfterEvent(document, "pseudoRule", {
          ...detail,
          pseudoRule,
          addedRules,
          removedRules: [],
        });
        return true;
      }
    }
  }
  return false;
}
