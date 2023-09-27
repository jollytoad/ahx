import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import { triggerRule } from "./trigger_rule.ts";
import type {
  ActionSpec,
  AhxGuardRule,
  AhxRule,
  AhxTriggerRule,
  EventType,
  RuleOrigin,
  TriggerSpec,
} from "./types.ts";

const allRules = new Set<AhxRule>();
const eventRules = new Map<
  EventType,
  // TODO: may we don't need a Set here...
  WeakMap<RuleOrigin, Set<AhxTriggerRule>>
>();
const guardRules = new Set<AhxGuardRule>();
const cssStyleRules = new Set<CSSStyleRule>();

const eventTypes = new Set<EventType>();

export function addTriggerRules(
  origin: RuleOrigin,
  triggers: TriggerSpec[],
  actions: ActionSpec[],
): AhxTriggerRule[] {
  const rules: AhxTriggerRule[] = [];

  for (const trigger of triggers) {
    for (const action of actions) {
      const rule = addTriggerRule(origin, trigger, action);
      if (rule) {
        rules.push(rule);
      }
    }
  }

  return rules;
}

export function addTriggerRule(
  origin: RuleOrigin,
  trigger: TriggerSpec,
  action: ActionSpec,
): AhxTriggerRule | undefined {
  const rule: AhxTriggerRule = {
    origin: new WeakRef(origin),
    trigger,
    action,
  };

  if (triggerBeforeEvent(document, "addRule", rule)) {
    const eventType = rule.trigger.eventType;

    let rulesPerOrigin = eventRules.get(eventType);

    if (!rulesPerOrigin) {
      rulesPerOrigin = new WeakMap();
      eventRules.set(eventType, rulesPerOrigin);
    }

    let rules = rulesPerOrigin.get(origin);

    if (!rules) {
      rules = new Set();
      rulesPerOrigin.set(origin, rules);
    }

    // TODO: Deduplicate rules

    rules.add(rule);

    allRules.add(rule);

    if (origin instanceof CSSStyleRule) {
      cssStyleRules.add(origin);
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

export function addGuardRule(
  cssRule: CSSStyleRule,
  options: Omit<AhxGuardRule, "origin">,
): AhxGuardRule {
  const guardRule: AhxGuardRule = {
    origin: new WeakRef(cssRule),
    ...options,
  };

  allRules.add(guardRule);
  guardRules.add(guardRule);
  cssStyleRules.add(cssRule);

  return guardRule;
}

export function removeRules(origin: RuleOrigin): Iterable<AhxRule> {
  const removedRules = new Set<AhxRule>();

  for (const rulesPerOrigin of eventRules.values()) {
    const triggerRules = rulesPerOrigin.get(origin);
    if (triggerRules) {
      for (const rule of triggerRules) {
        removedRules.add(rule);
        allRules.delete(rule);
      }
      triggerRules.clear();
      rulesPerOrigin.delete(origin);
      if (origin instanceof CSSStyleRule) {
        cssStyleRules.delete(origin);
      }
    }
  }

  for (const rule of guardRules) {
    const ruleTarget = rule.origin.deref();
    if (!ruleTarget || ruleTarget === origin) {
      guardRules.delete(rule);
      removedRules.add(rule);
    }
  }

  return removedRules.values();
}

export function getRules(): Iterable<AhxRule> {
  return allRules.values();
}

export function* getRulesForEvent(
  event: Event,
): Iterable<[AhxTriggerRule, Element]> {
  if (event.target instanceof Element) {
    const rulesPerOrigin = eventRules.get(event.type);
    const recursive = event instanceof CustomEvent && !!event.detail?.recursive;

    if (rulesPerOrigin) {
      // Trigger element rules
      yield* getTriggerRules(rulesPerOrigin, event.target, event.target);

      // Trigger css rules
      for (const cssStyleRule of cssStyleRules) {
        if (isEnabled(cssStyleRule)) {
          // ... that match the element
          if (event.target.matches(cssStyleRule.selectorText)) {
            yield* getTriggerRules(rulesPerOrigin, cssStyleRule, event.target);
          }

          // ... on all sub-elements that match the selector
          if (recursive) {
            for (
              const elt of event.target.querySelectorAll(
                cssStyleRule.selectorText,
              )
            ) {
              yield* getTriggerRules(rulesPerOrigin, cssStyleRule, elt);
            }
          }
        }
      }
    }
  }
}

function* getTriggerRules(
  rulesPerOrigin: WeakMap<RuleOrigin, Set<AhxTriggerRule>>,
  ruleOrigin: RuleOrigin,
  eventTarget: EventTarget,
): Iterable<[AhxTriggerRule, Element]> {
  if (eventTarget instanceof Element) {
    const rules = rulesPerOrigin.get(ruleOrigin);

    if (rules) {
      for (const rule of rules) {
        yield [rule, eventTarget];
      }
    }
  }
}

function eventListener(event: Event) {
  for (const [rule, elt] of getRulesForEvent(event)) {
    triggerRule(rule, elt);
  }
}

function isEnabled(styleRule: CSSStyleRule): boolean {
  return !!styleRule.parentStyleSheet && !styleRule.parentStyleSheet.disabled;
}
