import type { Control } from "@ahx/types";
import { PREFIX } from "@ahx/custom/log/config.ts";

const BOLD = "font-weight: bold;";
const CODE = "background-color: highlight;";
const RESET = "font-weight: normal; color: inherit; background-color: inherit;";
const PIPELINE = "color: light-dark(blue,skyblue);" + BOLD;
const EVENT = "color: light-dark(teal,cyan);" + BOLD;

export function event(event: Event, target?: EventTarget): void {
  // deno-lint-ignore no-explicit-any
  const control = (event as any).control as Control;
  if (control) {
    console.debug(
      `${PREFIX}%c%s%c %c%s%c="%c%s%c" %o %O`,
      EVENT,
      event.type,
      RESET,
      PIPELINE,
      `on-${control.eventType}`,
      RESET,
      CODE,
      control,
      RESET,
      target,
      control,
    );
  } else {
    console.debug(
      `${PREFIX}%c%s%c %O %o`,
      EVENT,
      event.type,
      RESET,
      event,
      target,
    );
  }
}
