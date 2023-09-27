import { getAhxValue } from "./get_ahx_value.ts";
import { swap } from "./swap.ts";
import {
  triggerAfterEvent,
  triggerBeforeEvent,
  triggerErrorEvent,
} from "./trigger_event.ts";
import type { AhxTriggerRule } from "./types.ts";

type TimeoutHandle = ReturnType<typeof setTimeout>;

const triggeredOnce = new WeakSet<Element>();

const delayed = new WeakMap<Element, TimeoutHandle>();

export function triggerRule(rule: AhxTriggerRule, elt: Element) {
  if (isDenied(elt)) {
    triggerErrorEvent(elt, "triggerDenied", { rule });
    return;
  }

  if (triggerBeforeEvent(elt, "triggerRule", rule)) {
    if (rule.trigger.target) {
      if (!elt.matches(rule.trigger.target)) {
        return;
      }
    }

    if (rule.trigger.once) {
      if (triggeredOnce.has(elt)) {
        return;
      } else {
        triggeredOnce.add(elt);
      }
    }

    if (rule.trigger.changed) {
      // TODO: return if value hasn't changed
    }

    if (delayed.has(elt)) {
      clearTimeout(delayed.get(elt));
      delayed.delete(elt);
    }

    // TODO: throttle

    if (rule.trigger.throttle) {
      // TODO
    } else if (rule.trigger.delay) {
      // TODO
    } else {
      performAction(elt, rule);
    }

    triggerAfterEvent(elt, "triggerRule", rule);
  }
}

function isDenied(elt: Element) {
  return getAhxValue(elt, "deny-trigger") === "true";
}

async function performAction(elt: Element, rule: AhxTriggerRule) {
  if (triggerBeforeEvent(elt, "performAction", rule)) {
    switch (rule.action.type) {
      case "request": {
        const response = await fetch(rule.action.url, {
          method: rule.action.method,
        });

        swap(elt, response);
      }
    }

    triggerAfterEvent(elt, "performAction", rule);
  }
}
