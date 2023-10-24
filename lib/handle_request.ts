import {
  dispatchAfter,
  dispatchBefore,
  dispatchError,
} from "./util/dispatch.ts";
import { handleSwap } from "./handle_swap.ts";
import type { ActionDetail, ActionRequestSpec } from "./types.ts";
import { asAhxHeaderName } from "./util/names.ts";

export async function handleRequest(props: ActionDetail) {
  const { source, action, target, swap, controlOwner, targetOwner } = props;

  if (action.type !== "request") {
    return;
  }

  const request = prepareRequest({ ...props, action });

  if (!request) {
    return;
  }

  const detail = { request };

  if (dispatchBefore(source, "request", detail)) {
    const { request } = detail;

    try {
      const response = await fetch(request);

      dispatchAfter(source, "request", { request, response });

      if (response.headers.has(asAhxHeaderName("refresh"))) {
        const detail = {
          ...props,
          request,
          response,
          refresh: true,
          url: new URL(location.href),
        };
        if (dispatchBefore(source, "navigate", detail)) {
          location.reload();
          return;
        }
      }

      await handleSwap({
        ...swap,
        target,
        response,
        controlOwner,
        targetOwner,
      });
    } catch (error) {
      dispatchAfter(source, "request", { request, error });
    }
  }
}

function prepareRequest(detail: ActionDetail & { action: ActionRequestSpec }) {
  const { action, formData, source } = detail;

  if (!action.url) {
    dispatchError(source, "invalidRequest", {
      action,
      reason: "Missing URL",
    });
    return;
  }

  const url = new URL(action.url);

  const headers = new Headers();

  const init: RequestInit = {
    method: action.method.toUpperCase(),
    headers,
  };

  headers.set("Accept", "text/html,application/xhtml+xml,text/plain;q=0.9");
  headers.set(asAhxHeaderName("request"), "true");
  headers.set(
    asAhxHeaderName("current-url"),
    source.ownerDocument.location.href,
  );

  if (formData) {
    switch (init.method) {
      case "GET":
      case "HEAD":
      case "DELETE":
        for (const [key, value] of formData) {
          if (typeof value === "string") {
            url.searchParams.append(key, value);
          }
        }
        break;

      case "PUT":
      case "POST":
      case "PATCH":
        if (containsFile(formData)) {
          init.body = formData;
          headers.set("Content-Type", "multipart/form-data");
        } else {
          // deno-lint-ignore no-explicit-any
          init.body = new URLSearchParams(formData as any);
          headers.set("Content-Type", "application/x-www-form-urlencoded");
        }
    }
  }

  return new Request(url, init);
}

function containsFile(formData: FormData): boolean {
  for (const value of formData.values()) {
    if (value instanceof File) {
      return true;
    }
  }
  return false;
}
