/**
 * A cache for Hypermedia Controls.
 *
 * The controls are stored with weak references to the source of the
 * control and the control itself. So the GC may still collect
 * controls that are no longer in use.
 *
 * @module
 */
import type { Control, ControlSource, EventType } from "@ahx/types";

const indexed = new WeakMap<
  ControlSource,
  Map<EventType, Promise<WeakRef<Control> | undefined>>
>();

/**
 * Get the Hypermedia Control cached for the given control source
 * and event type.
 *
 * @param source may be a DOM Element, CSS rule or selector
 * @param eventType the event that activates the control
 */
export async function getControl(
  source?: ControlSource,
  eventType?: EventType,
): Promise<Control | undefined> {
  return (await indexed.get(source!)?.get(eventType!))?.deref();
}

/**
 * List all event types with cached Controls for the given
 * control source.
 *
 * @param source may be a DOM Element, CSS rule or selector
 */
export function getEventTypes(
  source?: ControlSource,
): Iterable<EventType> {
  return indexed.get(source!)?.keys() ?? [];
}

/**
 * Cache a Hypermedia Control for the given control source
 * and event type.
 *
 * @param source may be a DOM Element, CSS rule or selector
 * @param eventType the event that activates the control
 * @param control a Promise of maybe the Control
 */
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
