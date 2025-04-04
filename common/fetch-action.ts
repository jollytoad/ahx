import type { ActionConstruct, ActionResult } from "@ahx/types";
import { getFormDetails } from "./form-details.ts";

const bodyMethods = new Set(["query", "put", "post", "patch"]);

// TODO: this should probably not implicitly gather any data itself,
// to allow a before to check the data passed to a request.
// Alternatively dispatch a dedicated pre-request event that can be cancelled.

export const fetchAction =
  (method?: string): ActionConstruct =>
  (urlArg?: string) =>
  async (
    {
      event,
      control,
      action,
      index,
      signal,
      targets,
      request: requestInit,
      jsonData,
      formData,
      trace,
    },
  ): Promise<ActionResult> => {
    let url: string | URL | undefined = urlArg ?? requestInit?.url;
    const headers = new Headers(requestInit?.headers);
    let body: BodyInit | ReadableStream<Uint8Array> | null | undefined =
      requestInit?.body;

    const target = targets?.[0];
    if (
      jsonData === undefined && formData === undefined && body === undefined
    ) {
      const result = getFormDetails(target, event);

      if (result) {
        formData ??= result.formData;
        url ??= result.request.url;
        method ??= result.request.method;
        body ??= result.request.body;
        if (result.request.headers) {
          Object.entries(result.request.headers).forEach(([key, value]) =>
            headers.append(key, value)
          );
        }
      }
    }

    if (!url) {
      throw new Error("No URL available for request");
    }

    method ??= "get";

    const isBodyMethod = bodyMethods.has(method.toLowerCase());

    const base = target instanceof Node
      ? target.baseURI
      : control.root?.baseURI;
    url = new URL(url, base);

    headers.set("ahx-pipeline", control.toString());
    headers.set("ahx-action", action!.toString());
    headers.set("ahx-index", index.toString());
    headers.set("ahx-trace", trace);

    if (isBodyMethod) {
      if (body === undefined) {
        if (jsonData !== undefined) {
          headers.set("content-type", "application/json");
          body = JSON.stringify(jsonData);
        } else if (formData !== undefined) {
          body = formData;
        }
      }
    } else {
      if (formData !== undefined) {
        for (const [name, value] of formData) {
          if (typeof value === "string") {
            url.searchParams.append(name, value);
          }
        }
      }
      body = null;
    }

    const request = new Request(
      url,
      {
        ...requestInit,
        headers,
        body,
        duplex: "half",
        method,
        signal,
      } as RequestInit & { duplex?: "half" },
    );

    return {
      request,
      response: await fetch(request),
    };
  };
