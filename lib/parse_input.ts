import { parseCssValue } from "./parse_css_value.ts";
import type { InputModifier, InputSpec } from "./types.ts";

const MODIFIERS = new Set<string>(
  ["replace", "append", "join"] satisfies InputModifier[],
);

export function parseInput(elt: Element): InputSpec | undefined {
  const inputName = parseCssValue({ elt, prop: "input" }).value;
  if (inputName) {
    const modifier = parseCssValue({ elt, prop: "input-modifier" }).value;
    const inputSeparator = modifier === "join"
      ? parseCssValue({ elt, prop: "input-separator" }).value ?? " "
      : undefined;
    return {
      inputName,
      inputModifier: isModifier(modifier) ? modifier : "replace",
      inputSeparator,
    };
  }
}

function isModifier(value?: string): value is InputModifier {
  return !!value && MODIFIERS.has(value);
}
