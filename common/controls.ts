import type { Control, ControlSource, EventType } from "@ahx/types";

const indexed = new WeakMap<
  ControlSource,
  Map<EventType, Promise<WeakRef<Control> | undefined>>
>();

export async function getControl(
  source?: ControlSource,
  eventType?: EventType,
): Promise<Control | undefined> {
  return (await indexed.get(source!)?.get(eventType!))?.deref();
}

export function getEventTypes(
  source?: ControlSource,
): Iterable<EventType> {
  return indexed.get(source!)?.keys() ?? [];
}

export function storeControl(
  source: ControlSource,
  eventType: EventType,
  control: Promise<Control | void>,
): Promise<Control | void> {
  let controls = indexed.get(source);
  if (!controls) {
    indexed.set(source, controls = new Map());
  }
  controls.set(
    eventType,
    control.then((control) => control ? new WeakRef(control) : undefined),
  );
  return control;
}
