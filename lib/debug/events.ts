import { config } from "../config.ts";
import type { AhxEventType, EventType } from "../types.ts";

interface LoggerConfig {
  group: boolean | "collapse";
  include: (AhxEventType | "error" | "veto")[];
}

export const loggerConfig: LoggerConfig = {
  group: false,
  include: [],
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

    if (detail?._after && loggerConfig.group) {
      console.groupEnd();
    }

    if (detail?._before) {
      const method = loggerConfig.group
        ? loggerConfig.group === true ? "group" : "groupCollapsed"
        : "debug";

      console[method](
        event.type,
        event,
        detail,
      );
    } else {
      console.debug(event.type, event, detail);
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
