import { objectsWithInternal } from "./internal.ts";

export function* getValueRules(): Iterable<CSSStyleRule> {
  for (const [rule, isValueRule] of objectsWithInternal("isValueRule")) {
    if (rule instanceof CSSStyleRule && isValueRule) {
      yield rule;
    }
  }
}
