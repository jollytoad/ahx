import { config } from "../config.ts";

const AHX_EVENTS = new Set(["load", "watch"]);

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
