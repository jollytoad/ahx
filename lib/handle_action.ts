import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { querySelectorExt } from "./query_selector.ts";
import { handleRequest } from "./handle_request.ts";
import { getInternal, hasInternal } from "./internal.ts";
import type { ActionDetail } from "./types.ts";
import { parseAttrValue } from "./parse_attr_value.ts";
import { handleHarvest } from "./handle_harvest.ts";

export async function handleAction(detail: ActionDetail) {
  const { source, origin } = detail;

  const query = parseAttrValue(origin, "include").value;
  const include = querySelectorExt(source, query);

  detail.formData = include ? getFormData(include) : undefined;

  if (dispatchBefore(source, "handleAction", detail)) {
    switch (detail.action.type) {
      case "request":
        await handleRequest(detail);
        break;

      case "harvest":
        await handleHarvest(detail);
        break;
    }

    dispatchAfter(source, "handleAction", detail);
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
