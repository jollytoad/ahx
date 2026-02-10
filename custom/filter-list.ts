import type { Feature } from "@ahx/types";

// TODO: generate from given packages (eg. @ahx/actions)
// by looking for bindings that include args.
export const allowBindings: Set<string> = new Set([
  "attr:on",
  "cssprop:on",
  "observe:*",
  "action:*",
  "action:import css",
  "action:key dispatch",
  "action:target attr",
  "action:target xpath-class",
  "action:target xpath",
]);

export const denyBindings: Set<string> = new Set([]);

/**
 * The default binding predicate allows all binding through
 */
function allowBinding(feature: Feature, binding: string[]): boolean {
  return hasMatch(allowBindings, feature, binding, true) &&
    !hasMatch(denyBindings, feature, binding, false);
}

function hasMatch(
  patterns: Set<string>,
  feature: Feature,
  binding: string[],
  ifEmpty: boolean,
) {
  // Shortcut when no patterns supplied
  if (patterns.size === 0) return ifEmpty;

  // Check for an exact binding match
  if (patterns.has(feature.kind + ":" + binding.join(" "))) return true;

  // Check for a match with the last binding item replaced with a wildcard `*`
  if (
    patterns.has(feature.kind + ":" + binding.toSpliced(-1, 1, "*").join(" "))
  ) return true;

  return false;
}

export default allowBinding;
