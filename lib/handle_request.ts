import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { swap } from "./swap.ts";
import type { ActionSpec, HandleActionDetail } from "./types.ts";

export async function handleRequest(
  detail: HandleActionDetail,
  formData?: FormData,
) {
  const { target, action, originOwner } = detail;

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

          await swap(target, response, originOwner);
        } catch (error) {
          dispatchAfter(target, "request", { request, error });
        }
      }
    }
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
