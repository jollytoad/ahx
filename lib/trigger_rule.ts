import { swap } from "./swap.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { AhxRule } from "./types.ts";

type TimeoutHandle = ReturnType<typeof setTimeout>;

const triggeredOnce = new WeakSet<Element>();

const delayed = new WeakMap<Element, TimeoutHandle>();

export function triggerRule(rule: AhxRule, elt: Element) {
  if (elt && triggerBeforeEvent(elt, "triggerRule", rule)) {
    // TODO: should parseCssValue
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

async function performAction(elt: Element, rule: AhxRule) {
  if (triggerBeforeEvent(elt, "performAction", rule)) {
    switch (rule.action.type) {
      case "request": {
        const response = await fetch(rule.action.url, {
          method: rule.action.method,
        });

        swap(elt, response);

        // if (
        //   response.ok &&
        //   response.headers.get("Content-Type")?.startsWith("text/html")
        // ) {
        //   console.log(response);
        //   elt.outerHTML = await response.text();
        // }
      }
    }

    triggerAfterEvent(elt, "performAction", rule);
  }
}
