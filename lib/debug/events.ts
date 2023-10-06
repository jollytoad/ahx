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

export function eventsAll() {
  config.enableDebugEvent = true;
  addEventListener(config.prefix, logger);
}

export function eventsNone() {
  config.enableDebugEvent = false;
  removeEventListener(config.prefix, logger);
}

export function logger({ detail: event }: CustomEvent<CustomEvent>) {
  const { type, target, detail } = event;

  if (shouldLog(type)) {
    if (detail?._after && loggerConfig.group) {
      console.groupEnd();
    }

    if (detail?._before) {
      const method = loggerConfig.group
        ? loggerConfig.group === true ? "group" : "groupCollapsed"
        : "debug";

      console[method]("%s -> %o %o", type, target, detail);
    } else {
      console.debug("%s -> %o %o", type, target, detail);
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
