import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { getInternal } from "./util/internal.ts";
import {
  dispatchAfter,
  dispatchBefore,
  dispatchError,
} from "./util/dispatch.ts";
import type { ActionDetail, TriggerDetail } from "./types.ts";
import { handleAction } from "./handle_action.ts";
import { enqueueAction } from "./util/queue.ts";

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

    // TODO: throttle

    if (trigger?.throttle) {
      // TODO
    } else if (trigger?.delay) {
      setTimeout(doAction, trigger.delay);
    } else {
      setTimeout(doAction, 0);
    }

    dispatchAfter(source, "trigger", detail);
  }

  function doAction() {
    if (hasTarget(detail)) {
      handleAction(detail);
    } else {
      enqueueAction(detail);
    }
  }
}

export function isDenied(elt: Element) {
  // TODO: Should get calculated CSS value
  const [deny] = parseAttrOrCssValue("deny-trigger", elt);
  return deny === "true";
}

function hasTarget(detail: TriggerDetail): detail is ActionDetail {
  return detail.target instanceof Element;
}
