import { getAhxValue } from "./get_ahx_value.ts";
import {
  deleteInternal,
  getInternal,
  hasInternal,
  setInternal,
} from "./internal.ts";
import { dispatchAfter, dispatchBefore, dispatchError } from "./dispatch.ts";
import type { AhxTriggered } from "./types.ts";
import { handleAction } from "./handle_action.ts";

export function handleTrigger(triggered: AhxTriggered) {
  const { trigger, target } = triggered;

  if (isDenied(target)) {
    dispatchError(target, "triggerDenied", triggered);
    return;
  }

  if (dispatchBefore(target, "handleTrigger", triggered)) {
    if (trigger.target) {
      if (!target.matches(trigger.target)) {
        return;
      }
    }

    if (trigger.once) {
      if (hasInternal(target, "triggeredOnce")) {
        return;
      } else {
        setInternal(target, "triggeredOnce", true);
      }
    }

    if (trigger.changed) {
      // TODO: return if value hasn't changed
    }

    if (hasInternal(target, "delayed")) {
      clearTimeout(getInternal(target, "delayed"));
      deleteInternal(target, "delayed");
    }

    // TODO: throttle

    if (trigger.throttle) {
      // TODO
    } else if (trigger.delay) {
      // TODO
    } else {
      handleAction(triggered);
    }

    dispatchAfter(target, "handleTrigger", triggered);
  }
}

export function isDenied(elt: Element) {
  return getAhxValue(elt, "deny-trigger") === "true";
}
