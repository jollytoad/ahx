import { getAhxValue } from "./get_ahx_value.ts";
import {
  deleteInternal,
  getInternal,
  hasInternal,
  setInternal,
} from "./internal.ts";
import { swap } from "./swap.ts";
import { dispatchAfter, dispatchBefore, dispatchError } from "./dispatch.ts";
import type { AhxTrigger } from "./types.ts";

export function handleTrigger(trigger: AhxTrigger, elt: Element) {
  if (isDenied(elt)) {
    dispatchError(elt, "triggerDenied", trigger);
    return;
  }

  if (dispatchBefore(elt, "trigger", trigger)) {
    if (trigger.trigger.target) {
      if (!elt.matches(trigger.trigger.target)) {
        return;
      }
    }

    if (trigger.trigger.once) {
      if (hasInternal(elt, "triggeredOnce")) {
        return;
      } else {
        setInternal(elt, "triggeredOnce", true);
      }
    }

    if (trigger.trigger.changed) {
      // TODO: return if value hasn't changed
    }

    if (hasInternal(elt, "delayed")) {
      clearTimeout(getInternal(elt, "delayed"));
      deleteInternal(elt, "delayed");
    }

    // TODO: throttle

    if (trigger.trigger.throttle) {
      // TODO
    } else if (trigger.trigger.delay) {
      // TODO
    } else {
      performAction(trigger, elt);
    }

    dispatchAfter(elt, "trigger", trigger);
  }
}

function isDenied(elt: Element) {
  return getAhxValue(elt, "deny-trigger") === "true";
}

async function performAction(trigger: AhxTrigger, elt: Element) {
  if (dispatchBefore(elt, "performAction", trigger)) {
    switch (trigger.action.type) {
      case "request": {
        const response = await fetch(trigger.action.url, {
          method: trigger.action.method,
        });

        swap(elt, response);
      }
    }

    dispatchAfter(elt, "performAction", trigger);
  }
}
