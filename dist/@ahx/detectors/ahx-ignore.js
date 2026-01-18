
import { isCSSStyleRule, isElement } from "@ahx/common/guards.js";

export function* ahxIgnoreDetector(
  node,
) {
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
