import { config } from "../config.ts";
import type { AhxEventType, EventType } from "../types.ts";

export const loggerConfig = {
  collapse: true,
  include: [] as (AhxEventType | "error" | "veto")[],
};

let rootRef: WeakRef<EventTarget> | undefined;

export function eventsAll(root: EventTarget = document) {
  config.enableAhxCombinedEvent = true;
  if (!rootRef) {
    root.addEventListener(config.prefix, logger);
    rootRef = new WeakRef(root);
  }
}

export function eventsNone() {
  rootRef?.deref()?.removeEventListener(config.prefix, logger);
  rootRef = undefined;
}

export function logger({ detail: event }: CustomEvent<CustomEvent>) {
  if (shouldLog(event.type)) {
    const detail = event.detail;
    if (detail?._before) {
      console[loggerConfig.collapse ? "groupCollapsed" : "group"](
        event.type,
        event,
        detail,
      );
    } else {
      console.log(event.type, event, detail);
    }
    if (detail?._after) {
      console.groupEnd();
    }
  }
}

function shouldLog(type: EventType): boolean {
  if (loggerConfig.include?.length) {
    if (loggerConfig.include.some((v) => type.includes(`:${v}`))) {
      return true;
    }
    return false;
  }
  return true;
}
