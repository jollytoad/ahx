import type { Control } from "@ahx/types";
import { getConfig } from "@ahx/custom/config.ts";
import * as log from "@ahx/custom/log/event.ts";

export interface AhxEventInit extends EventInit {
  control?: Control;
}

export class AhxEvent extends Event {
  control?: Control;

  constructor(type: string, { control, ...init }: AhxEventInit = {}) {
    super(type, {
      bubbles: true,
      cancelable: false,
      composed: true,
      ...init,
    });
    this.control = control;
  }
}

export function dispatchAhxEvent(
  eventType: string,
  target: EventTarget,
  init?: AhxEventInit,
): boolean {
  const { eventPrefix } = getConfig(target, "eventPrefix");

  const event = new AhxEvent(eventPrefix + eventType, init);

  log.event(event, target);

  return target.dispatchEvent(event);
}
