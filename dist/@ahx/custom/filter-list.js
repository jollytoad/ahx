

export const allowBindings = new Set([
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

export const denyBindings = new Set([]);

function allowBinding(feature, binding) {
  return hasMatch(allowBindings, feature, binding, true) &&
    !hasMatch(denyBindings, feature, binding, false);
}

function hasMatch(
  patterns,
  feature,
  binding,
  ifEmpty,
) {
    if (patterns.size === 0) return ifEmpty;

    if (patterns.has(feature.kind + ":" + binding.join(" "))) return true;

    if (
    patterns.has(feature.kind + ":" + binding.toSpliced(-1, 1, "*").join(" "))
  ) return true;

  return false;
}

export default allowBinding;
