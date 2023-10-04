import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { querySelectorExt } from "./query_selector.ts";
import { handleRequest } from "./handle_request.ts";
import { getInternal, hasInternal } from "./internal.ts";
import type { HandleActionDetail, HandleTriggerDetail } from "./types.ts";
import { parseCssValue } from "./parse_css_value.ts";

export async function handleAction(triggered: HandleTriggerDetail) {
  const { target } = triggered;

  const query = parseCssValue({ elt: target, prop: "include" }).value;
  const include = querySelectorExt(target, query);
  const formData = include ? getFormData(include) : undefined;

  const detail: HandleActionDetail = {
    ...triggered,
    formData,
  };

  if (dispatchBefore(target, "handleAction", detail)) {
    switch (detail.action.type) {
      case "request":
        await handleRequest(detail, formData);
        break;
    }

    dispatchAfter(target, "handleAction", triggered);
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
