import { config } from "./config.ts";
import { getInternal, hasInternal, setInternal } from "./internal.ts";
import { dispatchAfter, dispatchBefore, dispatchError } from "./dispatch.ts";
import type { PseudoId, PseudoPlace } from "./types.ts";
import { resolveElement } from "./resolve_element.ts";
import { getOwner, setOwner } from "./owner.ts";

let nextPseudoId = 1;

export function processPseudoElements(
  rule: CSSStyleRule,
) {
  // TODO: better selectorText parsing
  const before = rule.selectorText.includes("::before");
  const after = before ? false : rule.selectorText.includes("::after");

  if (before || after) {
    const pseudoId = getInternal(rule, "pseudoId") || nextPseudoId++;
    const place = before ? "before" : "after";
    const parentSelector = rule.selectorText.replace(`::${place}`, "");

    for (const elt of document.querySelectorAll(parentSelector)) {
      // Insert a 'pseudo-element'
      createPseudoElement(elt, pseudoId, place);
    }

    return createPseudoRule(rule, pseudoId, place);
  }
}

function createPseudoElement(
  elt: Element,
  pseudoId: PseudoId,
  place: PseudoPlace,
) {
  const pseudoIdClass = `${config.prefix}-pseudo-${pseudoId}`;

  if (!elt.querySelector(`:scope > .${pseudoIdClass}`)) {
    const parentTag = elt.localName;

    let pseudoTag = config.pseudoChildTags[parentTag];

    if (pseudoTag === null) {
      dispatchError(elt, "pseudoElementNotPermitted", { parentTag });
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

    if (dispatchBefore(elt, "pseudoElement", detail)) {
      const insertPosition = detail.place === "before"
        ? "afterbegin"
        : "beforeend";

      elt.insertAdjacentElement(insertPosition, detail.pseudoElt);

      dispatchAfter(elt, "pseudoElement", detail);
    }
  }
}

function createPseudoRule(
  rule: CSSStyleRule,
  pseudoId: PseudoId,
  place: PseudoPlace,
) {
  if (!hasInternal(rule, "pseudoId")) {
    // Create a 'pseudo-rule' to target the 'pseudo-element'
    setInternal(rule, "pseudoId", pseudoId);

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
      owner: getOwner(rule),
    };

    const target = resolveElement(rule) ?? document;

    if (dispatchBefore(target, "pseudoRule", detail)) {
      const styleSheet = detail.pseudoRule.parentStyleSheet;
      if (styleSheet) {
        const cssRules = styleSheet.cssRules;

        const pseudoRule = cssRules[
          styleSheet.insertRule(detail.pseudoRule.cssText, cssRules.length)
        ] as CSSStyleRule;

        if (!detail.owner && styleSheet.href) {
          detail.owner = styleSheet.href;
        }

        if (detail.owner) {
          setOwner(pseudoRule, detail.owner);
        }

        dispatchAfter(target, "pseudoRule", {
          ...detail,
          pseudoRule,
        });

        return pseudoRule;
      }
    }
  }
}
