import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { findTarget } from "./find_target.ts";
import { getInternal, hasInternal } from "./internal.ts";
import { swap } from "./swap.ts";
import type {
  ActionSpec,
  HandleActionDetail,
  HandleTriggerDetail,
} from "./types.ts";

export async function handleAction(triggered: HandleTriggerDetail) {
  const { target } = triggered;

  const include = findTarget(target, "include");
  const formData = include ? getFormData(include) : undefined;

  const detail: HandleActionDetail = {
    ...triggered,
    formData,
  };

  if (dispatchBefore(target, "handleAction", detail)) {
    const { target, action, owner } = detail;

    switch (action.type) {
      case "request": {
        const detail = {
          request: prepareRequest(action, formData),
        };

        if (dispatchBefore(target, "request", detail)) {
          const { request } = detail;

          try {
            const response = await fetch(request);

            dispatchAfter(target, "request", { request, response });

            await swap(target, response, owner);
          } catch (error) {
            dispatchAfter(target, "request", { request, error });
          }
        }
      }
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

function prepareRequest(action: ActionSpec, formData?: FormData) {
  const url = new URL(action.url);

  const init: RequestInit = {
    method: action.method.toUpperCase(),
  };

  if (formData) {
    switch (init.method) {
      case "GET":
      case "HEAD":
      case "DELETE":
        for (const [key, value] of formData) {
          url.searchParams.append(key, String(value));
        }
        break;

      case "PUT":
      case "POST":
      case "PATCH":
        init.body = formData;
    }
  }

  return new Request(url, init);
}
