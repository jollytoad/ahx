import type { CSSNode } from "@ahx/types";

export function resolveNestedSelector(source: CSSNode): string {
  if (!source.selectorText.includes("&")) return source.selectorText;

  let parent = source.parentRule;
  while (parent) {
    if (parent.selectorText) {
      const parentSelector = resolveNestedSelector(parent);
      return source.selectorText.replaceAll("&", `:is(${parentSelector})`);
    }
    parent = parent.parentRule;
  }

  return source.selectorText;
}
