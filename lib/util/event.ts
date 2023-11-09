import { config } from "../config.ts";
import type { AhxOneShotMap } from "../types.ts";

const AHX_EVENTS = new Set<string>(
  ["load", "mutate"] satisfies Array<keyof AhxOneShotMap>,
);

export function toDOMEventType(type: string) {
  if (AHX_EVENTS.has(type)) {
    return `${config.prefix}:${type}`;
  }
  return type;
}

export function fromDOMEventType(type: string) {
  const prefix = `${config.prefix}:`;
  if (type.startsWith(prefix)) {
    return type.substring(prefix.length);
  }
  return type;
}
