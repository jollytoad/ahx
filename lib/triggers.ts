import { getInternal, objectsWithInternal } from "./internal.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { handleTrigger } from "./handle_trigger.ts";
import type {
  ActionSpec,
  EventType,
  HandleTriggerDetail,
  TriggerOrigin,
  TriggerSpec,
} from "./types.ts";
import { resolveElement } from "./resolve_element.ts";
import { getOwner } from "./owner.ts";

const eventTypes = new Set<EventType>();

export function addTriggers(
  origin: TriggerOrigin,
  triggers: TriggerSpec[],
  actions: ActionSpec[],
) {
  for (const trigger of triggers) {
    for (const action of actions) {
      addTrigger(origin, trigger, action);
    }
  }
}

export function addTrigger(
  origin: TriggerOrigin,
  trigger: TriggerSpec,
  action: ActionSpec,
) {
  const detail = {
    origin,
    trigger,
    action,
  };

  const target = resolveElement(origin) ?? document;

  if (dispatchBefore(target, "addTrigger", detail)) {
    const { trigger, action } = detail;
    const { eventType } = trigger;

    getInternal(origin, "triggers", () => new Map())
      .set(eventType, { trigger, action });

    if (!eventTypes.has(eventType)) {
      const detail = { eventType };
      if (dispatchBefore(document, "addEventType", detail)) {
        eventTypes.add(eventType);
        document.addEventListener(eventType, eventListener);

        dispatchAfter(document, "addEventType", detail);
      }
    }

    dispatchAfter(target, "addTrigger", detail);
  }
}

export function* getTriggersForEvent(
  event: Event,
): Iterable<HandleTriggerDetail> {
  if (event.target instanceof Element) {
    const target = event.target;
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;

    const trigger = getInternal(target, "triggers")?.get(event.type);

    if (trigger) {
      yield { ...trigger, target, origin: target, owner: getOwner(target) };
    }

    // Find css rules with triggers
    for (const [origin, triggers] of objectsWithInternal("triggers")) {
      if (origin instanceof CSSStyleRule) {
        const trigger = triggers.get(event.type);

        if (trigger && isEnabled(origin)) {
          // ... that match the element
          if (trigger && target.matches(origin.selectorText)) {
            yield { ...trigger, target, origin, owner: getOwner(origin) };
          }

          // ... on all sub-elements that match the selector
          if (recursive) {
            const found = target.querySelectorAll(origin.selectorText);
            for (const elt of found) {
              yield {
                ...trigger,
                target: elt,
                origin,
                owner: getOwner(origin),
              };
            }
          }
        }
      }
    }
  }
}

function eventListener(event: Event) {
  for (const triggered of getTriggersForEvent(event)) {
    handleTrigger(triggered);
  }
}

function isEnabled(styleRule: CSSStyleRule): boolean {
  return !!styleRule.parentStyleSheet && !styleRule.parentStyleSheet.disabled;
}
