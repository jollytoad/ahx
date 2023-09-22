import { config } from "./config.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type { RuleTarget } from "./types.ts";

export function getAhxValue(
  target: RuleTarget,
  name: string,
): string | undefined {
  if (target instanceof Element) {
    const attrValue = target.getAttribute(`${config.prefix}-${name}`);
    const { value, important } = parseCssValue({
      elt: target,
      prop: `--${config.prefix}-${name}`,
    });
    return important && value ? value : attrValue ?? value;
  } else {
    return parseCssValue({ rule: target, prop: `--${config.prefix}-${name}` })
      .value;
  }
}
