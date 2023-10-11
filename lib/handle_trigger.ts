import { parseAttrValue } from "./parse_attr_value.ts";
import {
  deleteInternal,
  getInternal,
  hasInternal,
  setInternal,
} from "./util/internal.ts";
import {
  dispatchAfter,
  dispatchBefore,
  dispatchError,
} from "./util/dispatch.ts";
import type { TriggerDetail } from "./types.ts";
import { handleAction } from "./handle_action.ts";

export function handleTrigger(detail: TriggerDetail) {
  const { trigger, source } = detail;

  if (isDenied(source)) {
    dispatchError(source, "triggerDenied", detail);
    return;
  }

  if (dispatchBefore(source, "handleTrigger", detail)) {
    if (trigger?.once) {
      if (hasInternal(source, "triggeredOnce")) {
        return;
      } else {
        setInternal(source, "triggeredOnce", true);
      }
    }

    if (trigger?.changed) {
      // TODO: return if value hasn't changed
    }

    if (hasInternal(source, "delayed")) {
      clearTimeout(getInternal(source, "delayed"));
      deleteInternal(source, "delayed");
    }

    // TODO: throttle

    if (trigger?.throttle) {
      // TODO
    } else if (trigger?.delay) {
      // TODO
    } else {
      handleAction(detail);
    }

    dispatchAfter(source, "handleTrigger", detail);
  }
}

export function isDenied(elt: Element) {
  return parseAttrValue(elt, "deny-trigger").value === "true";
}
