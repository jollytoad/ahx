import { parseCssValue } from "./parse_css_value.ts";
import type { TargetModifier, TargetSpec, TargetType } from "./types.ts";

const MODIFIERS = new Set<string>(
  ["replace", "append", "join"] satisfies TargetModifier[],
);

const TARGET_TYPES: TargetType[] = ["input", "attr"];

export function parseTarget(
  elt: Element,
  rule: CSSStyleRule,
): TargetSpec | undefined {
  const query = parseCssValue({ elt, rule, prop: "target" }).value || "this";
  const [type, name] = parseTargetTypeAndName(elt, rule);

  if (type && name) {
    const modifier = parseCssValue({ elt, rule, prop: "modifier" }).value;
    const separator = modifier === "join"
      ? parseCssValue({ elt, rule, prop: "separator" }).value || " "
      : undefined;

    return {
      query,
      type,
      name,
      modifier: isModifier(modifier) ? modifier : undefined,
      separator,
    };
  }
}

function parseTargetTypeAndName(
  elt: Element,
  rule: CSSStyleRule,
): [TargetType, string] | [] {
  for (const prop of TARGET_TYPES) {
    const { value } = parseCssValue({ elt, rule, prop });
    if (value) {
      return [prop, value];
    }
  }
  return [];
}

function isModifier(value?: string): value is TargetModifier {
  return !!value && MODIFIERS.has(value);
}
