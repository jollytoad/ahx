import { addTriggers } from "./triggers.ts";
import { parseTriggers } from "./parse_triggers.ts";
import type { EventType, TriggerOrigin } from "./types.ts";
import { parseActions } from "./parse_actions.ts";
import { parseAttrValue } from "./parse_attr_value.ts";
import { parseSwap } from "./parse_swap.ts";

export function processTriggers(
  origin: TriggerOrigin,
  defaultEventType: EventType,
) {
  const triggerValue = parseAttrValue(origin, "trigger").value;
  const triggers = parseTriggers(origin, triggerValue, defaultEventType);
  const actions = parseActions(origin);
  const swap = parseSwap(origin);

  addTriggers(origin, triggers, actions, swap);
}
