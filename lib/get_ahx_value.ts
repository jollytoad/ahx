import { config } from "./config.ts";
import { parseCssValue } from "./parse_css_value.ts";
import type { RuleOrigin } from "./types.ts";

export function getAhxValue(
  origin: RuleOrigin,
  name: string,
): string | undefined {
  if (origin instanceof Element) {
    const attrValue = origin.getAttribute(`${config.prefix}-${name}`);
    const { value, important } = parseCssValue({
      elt: origin,
      prop: `--${config.prefix}-${name}`,
    });
    return important && value ? value : attrValue ?? value;
  } else {
    return parseCssValue({ rule: origin, prop: `--${config.prefix}-${name}` })
      .value;
  }
}
