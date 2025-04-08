import type { Context, CSSPropertyFeature } from "@ahx/types";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";
import { isCSSStyleRule } from "@ahx/common/guards.ts";

export function* customCSSPropertyDetector(
  rule: unknown,
  context?: Context,
): Iterable<CSSPropertyFeature> {
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
