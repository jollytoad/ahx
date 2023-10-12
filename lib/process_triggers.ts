import { addTriggers } from "./triggers.ts";
import { parseTriggers } from "./parse_triggers.ts";
import type { TriggerOrigin } from "./types.ts";
import { parseActions } from "./parse_actions.ts";
import { parseSwap } from "./parse_swap.ts";

export function processTriggers(origin: TriggerOrigin) {
  const triggers = parseTriggers(origin);
  const actions = parseActions(origin);
  const swap = parseSwap(origin);

  addTriggers(origin, triggers, actions, swap);
}
