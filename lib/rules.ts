import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import { triggerRule } from "./trigger_rule.ts";
import type {
  ActionSpec,
  AhxRule,
  EventType,
  RuleTarget,
  TriggerSpec,
} from "./types.ts";

const allRules = new Set<AhxRule>();
const eventRules = new Map<EventType, WeakMap<RuleTarget, Set<AhxRule>>>();
const cssStyleRules = new Set<CSSStyleRule>();

const eventTypes = new Set<EventType>();

export function addRules(
  target: RuleTarget,
  triggers: TriggerSpec[],
  actions: ActionSpec[],
): AhxRule[] {
  const rules: AhxRule[] = [];

  for (const trigger of triggers) {
    for (const action of actions) {
      const rule = addRule(target, trigger, action);
      if (rule) {
        rules.push(rule);
      }
    }
  }

  return rules;
}

export function addRule(
  target: RuleTarget,
  trigger: TriggerSpec,
  action: ActionSpec,
): AhxRule | undefined {
  const rule: AhxRule = {
    target: new WeakRef(target),
    trigger,
    action,
  };

  if (triggerBeforeEvent(document, "addRule", rule)) {
    const eventType = rule.trigger.eventType;

    let targetRules = eventRules.get(eventType);

    if (!targetRules) {
      targetRules = new WeakMap();
      eventRules.set(eventType, targetRules);
    }

    let rules = targetRules.get(target);

    if (!rules) {
      rules = new Set();
      targetRules.set(target, rules);
    }

    rules.add(rule);

    allRules.add(rule);

    if (target instanceof CSSStyleRule) {
      cssStyleRules.add(target);
    }

    if (!eventTypes.has(eventType)) {
      const detail = { eventType };
      if (triggerBeforeEvent(document, "addEventType", detail)) {
        eventTypes.add(eventType);
        document.addEventListener(eventType, eventListener);

        triggerAfterEvent(document, "addEventType", detail);
      }
    }

    triggerAfterEvent(document, "addRule", rule);

    return rule;
  }
}

export function removeRules(target: RuleTarget): AhxRule[] {
  const removedRules: AhxRule[] = [];

  for (const targetRules of eventRules.values()) {
    const rules = targetRules.get(target);
    if (rules) {
      for (const rule of rules) {
        removedRules.push(rule);
        allRules.delete(rule);
      }
      rules.clear();
      targetRules.delete(target);
      if (target instanceof CSSStyleRule) {
        cssStyleRules.delete(target);
      }
    }
  }

  return removedRules;
}

export function getRules(): Iterable<AhxRule> {
  return allRules.values();
}

function eventListener(event: Event) {
  console.log("EVENT", event.type, event);

  if (event.target instanceof Element) {
    const targetRules = eventRules.get(event.type);
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;

    if (targetRules) {
      // Trigger element rules
      triggerRules(targetRules, event.target, event.target);

      // Trigger css rules
      for (const cssStyleRule of cssStyleRules) {
        if (isEnabled(cssStyleRule)) {
          // ... that match the element
          if (event.target.matches(cssStyleRule.selectorText)) {
            triggerRules(targetRules, cssStyleRule, event.target);
          }

          // ... on all sub-elements that match the selector
          if (recursive) {
            for (
              const elt of event.target.querySelectorAll(
                cssStyleRule.selectorText,
              )
            ) {
              triggerRules(targetRules, cssStyleRule, elt);
            }
          }
        }
      }
    }
  }
}

function isEnabled(styleRule: CSSStyleRule): boolean {
  return !!styleRule.parentStyleSheet && !styleRule.parentStyleSheet.disabled;
}

function triggerRules(
  targetRules: WeakMap<RuleTarget, Set<AhxRule>>,
  ruleTarget: RuleTarget,
  eventTarget: EventTarget,
) {
  if (eventTarget instanceof Element) {
    const rules = targetRules.get(ruleTarget);

    if (rules) {
      for (const rule of rules) {
        triggerRule(rule, eventTarget);
      }
    }
  }
}
