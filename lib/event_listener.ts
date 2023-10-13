import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { handleTrigger } from "./handle_trigger.ts";
import type { EventType, TriggerDetail } from "./types.ts";
import { getOwner } from "./util/owner.ts";
import { fromDOMEventType, toDOMEventType } from "./util/event.ts";
import { getControls } from "./util/controls.ts";
import { parseTarget } from "./parse_target.ts";

const eventTypes = new Set<EventType>();

export function initEventListener(eventType: EventType) {
  if (!eventTypes.has(eventType)) {
    const detail = { eventType };

    if (dispatchBefore(undefined, "addEventType", detail)) {
      eventTypes.add(eventType);

      addEventListener(toDOMEventType(eventType), eventListener);

      dispatchAfter(undefined, "addEventType", detail);
    }
  }
}

function eventListener(event: Event) {
  for (const detail of getTriggerDetailsForEvent(event)) {
    handleTrigger(detail);
  }
}

function* getTriggerDetailsForEvent(
  event: Event,
): Iterable<TriggerDetail> {
  if (event.target instanceof Element) {
    const controls = getControls(
      fromDOMEventType(event.type),
      event.target,
      isRecursive(event),
    );

    for (const [source, control, ctlSpec] of controls) {
      const target = parseTarget(source, control);
      yield {
        ...ctlSpec,
        event,
        source,
        sourceOwner: getOwner(source),
        target,
        targetOwner: getOwner(target),
        control,
        controlOwner: getOwner(control),
      };
    }
  }
}

function isRecursive(event: Event): boolean {
  return event instanceof CustomEvent && !!event.detail?.recursive;
}
