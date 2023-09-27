import { getInternal, objectsWithInternal } from "./internal.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { handleTrigger } from "./handle_trigger.ts";
import type {
  ActionSpec,
  AhxTrigger,
  EventType,
  TriggerOrigin,
  TriggerSpec,
} from "./types.ts";

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

  const target = origin instanceof Element
    ? origin
    : origin.parentStyleSheet?.ownerNode ??
      document;

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
): Iterable<[AhxTrigger, Element]> {
  if (event.target instanceof Element) {
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;

    const trigger = getInternal(event.target, "triggers")?.get(event.type);

    if (trigger) {
      yield [trigger, event.target];
    }

    // Find css rules with triggers
    for (const [origin, triggers] of objectsWithInternal("triggers")) {
      if (origin instanceof CSSStyleRule) {
        const trigger = triggers.get(event.type);

        if (trigger && isEnabled(origin)) {
          // ... that match the element
          if (trigger && event.target.matches(origin.selectorText)) {
            yield [trigger, event.target];
          }

          // ... on all sub-elements that match the selector
          if (recursive) {
            const found = event.target.querySelectorAll(origin.selectorText);
            for (const elt of found) {
              yield [trigger, elt];
            }
          }
        }
      }
    }
  }
}

function eventListener(event: Event) {
  for (const [trigger_, elt] of getTriggersForEvent(event)) {
    handleTrigger(trigger_, elt);
  }
}

function isEnabled(styleRule: CSSStyleRule): boolean {
  return !!styleRule.parentStyleSheet && !styleRule.parentStyleSheet.disabled;
}
