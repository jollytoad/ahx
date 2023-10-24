import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { querySelectorExt } from "./util/query_selector.ts";
import { handleRequest } from "./handle_request.ts";
import { getInternal, hasInternal } from "./util/internal.ts";
import type { ActionDetail } from "./types.ts";
import { parseAttrOrCssValue } from "./parse_attr_value.ts";
import { handleHarvest } from "./handle_harvest.ts";
import { parseCssValue } from "./parse_css_value.ts";

export async function handleAction(detail: ActionDetail) {
  const { source, control, action } = detail;

  const [query] = parseAttrOrCssValue("include", control, "whole");
  const include = querySelectorExt(source, query);

  detail.formData = include ? getFormData(include) : undefined;

  if (
    action.type === "request" && control instanceof CSSStyleRule &&
    action.url === undefined
  ) {
    const [url] = parseCssValue(action.method, control, source);
    if (url) {
      detail.action = {
        ...action,
        url: new URL(url, source.baseURI),
      };
    }
  }

  if (dispatchBefore(source, "action", detail)) {
    switch (detail.action.type) {
      case "request":
        await handleRequest(detail);
        break;

      case "harvest":
        await handleHarvest(detail);
        break;
    }

    dispatchAfter(source, "action", detail);
  }
}

function getFormData(elt: Element): FormData | undefined {
  if (hasInternal(elt, "formData")) {
    return getInternal(elt, "formData");
  }

  if (elt instanceof HTMLFormElement) {
    return new FormData(elt);
  }
}
