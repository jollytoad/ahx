import { config } from "./config.ts";

export function logAll(root: EventTarget = document) {
  config.enableAhxCombinedEvent = true;
  root.addEventListener(config.prefix, (event) => {
    if (event instanceof CustomEvent && event.detail instanceof CustomEvent) {
      event = event.detail;
    }
    const detail = (event as CustomEvent).detail;
    if (detail?._before) {
      console.group(event.type, event, detail);
    } else {
      console.log(event.type, event, detail);
    }
    if (detail?._after) {
      console.groupEnd();
    }
  });
}
