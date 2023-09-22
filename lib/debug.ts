import { getRules } from "./rules.ts";

export function logRules() {
  console.group("AHX Rules");
  for (const rule of getRules()) {
    const { eventType, ...trigger } = rule.trigger;
    console.log(eventType, rule.target.deref(), trigger, rule.action);
  }
  console.groupEnd();
}
