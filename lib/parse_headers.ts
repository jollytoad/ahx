import { parseCssValue } from "./parse_css_value.ts";
import type { ControlDecl } from "./types.ts";
import { dispatchError } from "./util/dispatch.ts";
import { asAhxCSSPropertyName } from "./util/names.ts";

export function parseHeaders(
  control: ControlDecl,
  source: Element,
): Headers | undefined {
  if (control instanceof CSSStyleRule) {
    const [headersJson] = parseCssValue("headers", control, source, "whole");

    try {
      const headersObj = JSON.parse(headersJson!);
      return new Headers(headersObj);
    } catch {
      dispatchError(
        source,
        "invalidCssValue",
        {
          prop: asAhxCSSPropertyName("headers"),
          value: headersJson,
          rule: control,
          reason: "Must be a valid JSON object of request headers",
        },
      );
    }
  }
}
