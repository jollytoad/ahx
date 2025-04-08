import type { IgnoreFeature } from "@ahx/types";
import { isCSSStyleRule, isElement } from "@ahx/common/guards.ts";

export function* ahxIgnoreDetector(
  node: unknown,
): Iterable<IgnoreFeature> {
  if (isElement(node)) {
    if (node.hasAttribute("ahx-ignore")) {
      yield { ignore: true };
    }
  } else if (isCSSStyleRule(node)) {
    if (node.style.getPropertyValue("--ahx-ignore")) {
      yield { ignore: true };
    }
  }
}

export default ahxIgnoreDetector;
