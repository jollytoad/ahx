import { config } from "./config.ts";
import type { AhxErrorMap, AhxEventMap, EventType } from "./types.ts";

export function triggerEvent<T>(
  target: EventTarget,
  eventType: EventType,
  detail?: T,
  cancelable = true,
): boolean {
  const event = new CustomEvent(eventType, {
    bubbles: true,
    cancelable,
    detail,
  });

  if (config.enableAhxCombinedEvent) {
    document.dispatchEvent(
      new CustomEvent(config.prefix, {
        bubbles: false,
        cancelable: false,
        detail: event,
      }),
    );
  }

  return target.dispatchEvent(event);
}

export function triggerBeforeEvent<E extends keyof AhxEventMap>(
  target: EventTarget | undefined | null,
  name: E,
  detail: AhxEventMap[E][0],
): boolean {
  if (target) {
    // @ts-ignore to aid logging
    detail._before = true;
    const permitted = triggerEvent(target, `${config.prefix}:${name}`, detail);
    if (!permitted) {
      triggerEvent(target, `${config.prefix}:${name}:veto`, detail, false);
    }

    return permitted;
  }
  return false;
}

export function triggerAfterEvent<E extends keyof AhxEventMap>(
  target: EventTarget,
  name: E,
  detail?: AhxEventMap[E][1],
): void {
  // @ts-ignore to aid logging
  detail._after = true;
  // @ts-ignore to aid logging
  delete detail._before;

  triggerEvent(target, `${config.prefix}:${name}:done`, detail, false);
}

export function triggerErrorEvent<E extends keyof AhxErrorMap>(
  target: EventTarget,
  name: E,
  detail?: AhxErrorMap[E],
): void {
  triggerEvent(target, `${config.prefix}:${name}:error`, {
    error: name,
    ...detail,
  }, false);
}
