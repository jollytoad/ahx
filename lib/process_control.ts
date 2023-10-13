import { initEventListener } from "./event_listener.ts";
import type { ControlDetail } from "./types.ts";
import { resolveElement } from "./util/resolve_element.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { setInternal } from "./util/internal.ts";

export function processControl(detail: ControlDetail) {
  const target = resolveElement(detail.control);

  if (dispatchBefore(target, "processControl", detail)) {
    const { control, trigger, action, swap } = detail;
    const { eventType } = trigger;

    setInternal(control, `control:${eventType}`, { trigger, action, swap });

    initEventListener(eventType);

    dispatchAfter(target, "processControl", detail);
  }
}
