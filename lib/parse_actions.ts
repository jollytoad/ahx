import { config } from "./config.ts";
import { getAhxValue } from "./get_ahx_value.ts";
import type { ActionSpec, AhxName, TriggerOrigin } from "./types.ts";

export function parseActions(origin: TriggerOrigin): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const url = getAhxValue(origin, method as AhxName);
    if (url) {
      actionSpecs.push({
        type: "request",
        method,
        url,
      });
    }
  }

  return actionSpecs;
}
