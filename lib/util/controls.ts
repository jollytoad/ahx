import type { ControlDecl, ControlSpec, EventType } from "../types.ts";
import { getInternal, objectsWithInternal } from "./internal.ts";
import { isRuleEnabled } from "./rules.ts";

export function* getControlsFromElements(
  eventType: EventType,
  root: Element,
  recursive: boolean,
): Iterable<[Element, ControlDecl, ControlSpec]> {
  const ctlSpec = getInternal(root, `control:${eventType}`);

  if (ctlSpec) {
    yield [root, root, ctlSpec];
  }

  if (recursive) {
    for (const [elt, ctlSpec] of objectsWithInternal(`control:${eventType}`)) {
      if (
        elt instanceof Element && root.compareDocumentPosition(elt) &
          Node.DOCUMENT_POSITION_CONTAINED_BY
      ) {
        yield [elt, elt, ctlSpec];
      }
    }
  }
}

export function* getControlsFromRules(
  eventType: EventType,
  root: Element,
  recursive: boolean,
): Iterable<[Element, ControlDecl, ControlSpec]> {
  for (const [rule, ctlSpec] of objectsWithInternal(`control:${eventType}`)) {
    if (ctlSpec && rule instanceof CSSStyleRule && isRuleEnabled(rule)) {
      // ... that match the element
      if (root.matches(rule.selectorText)) {
        yield [root, rule, ctlSpec];
      }

      // ... on all sub-elements that match the selector
      if (recursive) {
        for (const elt of root.querySelectorAll(rule.selectorText)) {
          yield [elt, rule, ctlSpec];
        }
      }
    }
  }
}

export function* getControls(
  eventType: EventType,
  root: Element,
  recursive: boolean,
): Iterable<[Element, ControlDecl, ControlSpec]> {
  yield* getControlsFromElements(eventType, root, recursive);
  yield* getControlsFromRules(eventType, root, recursive);
}
