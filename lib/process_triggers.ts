import { addTriggers } from "./triggers.ts";
import { parseTriggers } from "./parse_triggers.ts";
import type { EventType, TriggerOrigin } from "./types.ts";
import { getAhxValue } from "./get_ahx_value.ts";
import { parseActions } from "./parse_actions.ts";

export function processTriggers(
  origin: TriggerOrigin,
  defaultEventType: EventType,
) {
  const triggerValue = getAhxValue(origin, "trigger");
  const triggers = parseTriggers(origin, triggerValue, defaultEventType);
  const actions = parseActions(origin);

  addTriggers(origin, triggers, actions);
}
