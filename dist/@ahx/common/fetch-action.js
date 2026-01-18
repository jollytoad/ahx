
import { getFormDetails } from "./form-details.js";
import { isNode } from "./guards.js";

const bodyMethods = new Set(["query", "put", "post", "patch"]);

export const fetchAction =
  (method) =>
  (urlArg) =>
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
  ) => {
    let url = urlArg ?? requestInit?.url;
    const headers = new Headers(requestInit?.headers);
    let body =
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

    const base = isNode(target) ? target.baseURI : control.root?.baseURI;
    url = new URL(url, base);

    headers.set("ahx-pipeline", control.toString());
    headers.set("ahx-action", action.toString());
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
      },
    );

    return {
      request,
      response: await fetch(request),
    };
  };
