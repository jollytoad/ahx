import { getInternal, setInternal } from "./util/internal.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { handleTrigger } from "./handle_trigger.ts";
import type {
  ActionSpec,
  EventType,
  SwapSpec,
  Trigger,
  TriggerDetail,
  TriggerOrigin,
  TriggerSpec,
} from "./types.ts";
import { resolveElement } from "./util/resolve_element.ts";
import { getOwner } from "./util/owner.ts";
import { querySelectorExt } from "./util/query_selector.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { parseAttrValue } from "./parse_attr_value.ts";
import { fromDOMEventType, toDOMEventType } from "./util/event.ts";
import {
  getTriggerElementsByEvent,
  getTriggerRulesByEvent,
} from "./util/rules.ts";

const eventTypes = new Set<EventType>();

export function addTriggers(
  origin: TriggerOrigin,
  triggers: TriggerSpec[],
  actions: ActionSpec[],
  swap: SwapSpec,
) {
  for (const trigger of triggers) {
    for (const action of actions) {
      addTrigger(origin, trigger, action, swap);
    }
  }
}

export function addTrigger(
  origin: TriggerOrigin,
  trigger: TriggerSpec,
  action: ActionSpec,
  swap: SwapSpec,
) {
  const detail = {
    origin,
    trigger,
    action,
    swap,
  };

  const target = resolveElement(origin) ?? document;

  if (dispatchBefore(target, "addTrigger", detail)) {
    const { trigger, action } = detail;
    const { eventType } = trigger;

    setInternal(origin, `trigger:${eventType}`, { trigger, action, swap });

    if (!eventTypes.has(eventType)) {
      const detail = { eventType };
      if (dispatchBefore(document, "addEventType", detail)) {
        eventTypes.add(eventType);
        document.addEventListener(toDOMEventType(eventType), eventListener);

        dispatchAfter(document, "addEventType", detail);
      }
    }

    dispatchAfter(target, "addTrigger", detail);
  }
}

export function* getTriggersForEvent(
  event: Event,
): Iterable<TriggerDetail> {
  if (event.target instanceof Element) {
    const eventType = fromDOMEventType(event.type);
    const source = event.target;
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;

    const found: [Element, Trigger][] = [];

    const trigger = getInternal(source, `trigger:${eventType}`);

    if (trigger) {
      found.push([source, trigger]);
    }

    if (recursive) {
      for (const [elt, trigger] of getTriggerElementsByEvent(eventType)) {
        if (
          source.compareDocumentPosition(elt) &
          Node.DOCUMENT_POSITION_CONTAINED_BY
        ) {
          found.push([elt, trigger]);
        }
      }
    }

    for (const [source, trigger] of found) {
      const sourceOwner = getOwner(source);
      const target = parseTarget(source);
      const targetOwner = getOwner(target);
      yield {
        ...trigger,
        event,
        source,
        sourceOwner,
        target,
        targetOwner,
        origin: source,
        originOwner: sourceOwner,
      };
    }

    // Find css rules with triggers
    for (const [origin, trigger] of getTriggerRulesByEvent(eventType)) {
      const found = [];

      // ... that match the element
      if (source.matches(origin.selectorText)) {
        found.push(source);
      }

      // ... on all sub-elements that match the selector
      if (recursive) {
        found.push(...source.querySelectorAll(origin.selectorText));
      }

      for (const source of found) {
        const target = parseTarget(source, origin);
        yield {
          ...trigger,
          event,
          source,
          sourceOwner: getOwner(source),
          target,
          targetOwner: getOwner(target),
          origin,
          originOwner: getOwner(origin),
        };
      }
    }
  }
}

function parseTarget(elt: Element, rule?: CSSStyleRule) {
  const targetQuery =
    (rule
      ? parseCssValue({ elt, rule, prop: "target" }).value
      : parseAttrValue(elt, "target").value) || "this";
  return querySelectorExt(elt, targetQuery) ?? elt;
}

function eventListener(event: Event) {
  for (const triggered of getTriggersForEvent(event)) {
    handleTrigger(triggered);
  }
}
