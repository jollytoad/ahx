import { config } from "./config.ts";
import type { AhxErrorMap, AhxEventMap, EventType } from "./types.ts";

export function dispatch<T>(
  target: EventTarget | undefined | null,
  type: EventType,
  detail?: T,
  cancelable = true,
): boolean {
  if (target !== null) {
    const event = new CustomEvent(type, {
      bubbles: !!target,
      cancelable,
      detail,
    });

    if (config.enableDebugEvent) {
      dispatchEvent(
        new CustomEvent(config.prefix, {
          bubbles: false,
          cancelable: false,
          detail: {
            type: event.type,
            target,
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            detail: event.detail,
          },
        }),
      );
    }

    return target && "dispatchEvent" in target
      ? target.dispatchEvent(event)
      : dispatchEvent(event);
  }
  return false;
}

export function dispatchBefore<E extends keyof AhxEventMap>(
  target: EventTarget | undefined | null,
  name: E,
  detail: AhxEventMap[E][0],
): boolean {
  // @ts-ignore to aid logging
  detail._before = true;

  const permitted = dispatch(target, `${config.prefix}:${name}`, detail);

  // @ts-ignore to aid logging
  delete detail._before;

  if (!permitted) {
    dispatch(target, `${config.prefix}:${name}:veto`, detail, false);
  }

  return permitted;
}

export function dispatchAfter<E extends keyof AhxEventMap>(
  target: EventTarget | undefined | null,
  name: E,
  detail?: AhxEventMap[E][1],
): void {
  // @ts-ignore to aid logging
  detail._after = true;

  dispatch(target, `${config.prefix}:${name}:done`, detail, false);

  // @ts-ignore to aid logging
  delete detail._after;
}

export function dispatchError<E extends keyof AhxErrorMap>(
  target: EventTarget | undefined | null,
  name: E,
  detail?: AhxErrorMap[E],
): void {
  dispatch(target, `${config.prefix}:${name}:error`, {
    error: name,
    ...detail,
  }, false);
}
