import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { deleteInternal, getInternal, hasInternal } from "./util/internal.ts";
import {
  dispatchAfter,
  dispatchBefore,
  dispatchError,
} from "./util/dispatch.ts";
import type { TriggerDetail } from "./types.ts";
import { handleAction } from "./handle_action.ts";

export function handleTrigger(detail: TriggerDetail) {
  const { control, trigger, source } = detail;

  if (isDenied(source)) {
    dispatchError(source, "triggerDenied", detail);
    return;
  }

  if (
    trigger?.once &&
    getInternal(source, `triggered:${trigger.eventType}`)?.has(control)
  ) {
    return;
  }

  if (trigger?.changed) {
    // TODO: return if value hasn't changed
  }

  if (dispatchBefore(source, "trigger", detail)) {
    if (trigger?.once) {
      getInternal(source, `triggered:${trigger.eventType}`, () => new WeakSet())
        .add(control);
    }

    if (hasInternal(control, "delayed")) {
      clearTimeout(getInternal(control, "delayed"));
      deleteInternal(control, "delayed");
    }

    // TODO: throttle

    if (trigger?.throttle) {
      // TODO
    } else if (trigger?.delay) {
      // TODO
    } else {
      handleAction(detail);
    }

    dispatchAfter(source, "trigger", detail);
  }
}

export function isDenied(elt: Element) {
  // TODO: Should get calculated CSS value
  const [deny] = parseAttrOrCssValue("deny-trigger", elt);
  return deny === "true";
}
