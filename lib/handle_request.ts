import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { handleSwap } from "./handle_swap.ts";
import type { ActionDetail, ActionRequestSpec } from "./types.ts";

export async function handleRequest(props: ActionDetail) {
  const { source, action, target, swap, formData, originOwner, targetOwner } =
    props;

  if (action.type !== "request") {
    return;
  }

  const detail = {
    request: prepareRequest(action, formData),
  };

  if (dispatchBefore(source, "request", detail)) {
    const { request } = detail;

    try {
      const response = await fetch(request);

      dispatchAfter(source, "request", { request, response });

      await handleSwap({
        ...swap,
        target,
        response,
        originOwner,
        targetOwner,
      });
    } catch (error) {
      dispatchAfter(source, "request", { request, error });
    }
  }
}

function prepareRequest(action: ActionRequestSpec, formData?: FormData) {
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
