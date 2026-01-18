
import { getConfig } from "@ahx/custom/config.js";
import * as log from "@ahx/custom/log/event.js";

export class AhxEvent extends Event {
  control;

  constructor(type, { control, ...init } = {}) {
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
  eventType,
  target,
  init,
) {
  const { eventPrefix } = getConfig(target, "eventPrefix");

  const event = new AhxEvent(eventPrefix + eventType, init);

  log.event(event, target);

  return target.dispatchEvent(event);
}
