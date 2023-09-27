import { parseActions } from "./parse_actions.ts";
import { hasAhxAttributes } from "./attributes.ts";
import { addTriggerRules } from "./rules.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import { parseTriggers } from "./parse_triggers.ts";
import type { AhxRule } from "./types.ts";
import { config } from "./config.ts";

export function processElement(elt: Element): AhxRule[] {
  if (hasAhxAttributes(elt)) {
    if (triggerBeforeEvent(elt, "processElement", {})) {
      const triggers = parseTriggers(
        elt,
        elt.getAttribute(`${config.prefix}-trigger`) ?? "",
      );
      const actions = parseActions(elt);

      const addedRules = addTriggerRules(elt, triggers, actions);

      triggerAfterEvent(elt, "processElement", {
        addedRules,
        removedRules: [],
      });

      return addedRules;
    }
  }
  return [];
}
