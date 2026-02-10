
import { potentialBindings } from "@ahx/common/potential-bindings.js";
import { isCSSStyleRule } from "@ahx/common/guards.js";

export function* customCSSPropertyDetector(
  rule,
  context,
) {
  if (isCSSStyleRule(rule)) {
    for (const prop of rule.style) {
      if (prop.startsWith("--")) {
        yield {
          kind: "cssprop",
          context,
          rule,
          name: prop,
          get value() {
            return this.rule.style.getPropertyValue(prop);
          },
          bindings: potentialBindings(prop.slice(2).split("-")),
        };
      }
    }
  }
}

export default customCSSPropertyDetector;
