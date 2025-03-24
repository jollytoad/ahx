import type { IgnoreFeature } from "@ahx/types";

export function* ahxIgnoreDetector(
  node: unknown,
): Iterable<IgnoreFeature> {
  if (node instanceof Element) {
    if (node.hasAttribute("ahx-ignore")) {
      yield { ignore: true };
    }
  } else if (node instanceof CSSStyleRule) {
    if (node.style.getPropertyValue("--ahx-ignore")) {
      yield { ignore: true };
    }
  }
}

export default ahxIgnoreDetector;
