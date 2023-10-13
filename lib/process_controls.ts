import { parseTriggers } from "./parse_triggers.ts";
import type { ControlDecl } from "./types.ts";
import { parseActions } from "./parse_actions.ts";
import { parseSwap } from "./parse_swap.ts";
import { processControl } from "./process_control.ts";

export function processControls(control: ControlDecl) {
  const triggers = parseTriggers(control);
  const actions = parseActions(control);
  const swap = parseSwap(control);

  for (const trigger of triggers) {
    for (const action of actions) {
      processControl({
        control,
        trigger,
        action,
        swap,
      });
    }
  }
}
