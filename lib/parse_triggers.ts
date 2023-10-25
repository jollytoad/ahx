import type { ControlDecl, TriggerSpec } from "./types.ts";
import { parseAttrOrCssValue } from "./parse_attr_value.ts";

export function parseTriggers(
  control: ControlDecl,
): TriggerSpec[] {
  const [rawValue] = parseAttrOrCssValue("trigger", control, "whole");
  const triggerSpecs: TriggerSpec[] = [];

  if (rawValue) {
    const triggerValues = rawValue.split(/\s*,\s*/);

    for (const triggerValue of triggerValues) {
      const [trigger, ...modifiers] = triggerValue.split(/\s+/);

      if (trigger) {
        const triggerSpec: TriggerSpec = { eventType: trigger };

        for (const modifier of modifiers) {
          switch (modifier) {
            // case "changed":
            case "once":
              triggerSpec[modifier] = true;
              break;
          }
        }

        triggerSpecs.push(triggerSpec);
      }
    }
  }

  return triggerSpecs;
}
