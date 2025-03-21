import type { ActionConstruct, ActionResult } from "@ahx/types";

export type MethodName = "get" | "query" | "put" | "post" | "patch" | "delete";

export const fetchAction =
  (method: MethodName, isBodyMethod: boolean): ActionConstruct =>
  (urlArg?: string) =>
  async (
    {
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
    if (!urlArg && requestInit && "url" in requestInit) {
      urlArg = requestInit.url;
    }

    if (!urlArg) {
      throw new Error("No URL available for request");
    }

    const base = targets instanceof Node
      ? targets.baseURI
      : control.root?.baseURI;
    const url = new URL(urlArg, base);

    const headers = new Headers(requestInit?.headers);
    let body: BodyInit | undefined = requestInit?.body ?? undefined;

    headers.set("ahx-pipeline", control.toString());
    headers.set("ahx-action", action!.toString());
    headers.set("ahx-index", index.toString());
    headers.set("ahx-trace", trace);

    const target = targets?.[0];
    if (
      jsonData === undefined && formData === undefined &&
      target instanceof HTMLFormElement
    ) {
      formData = new FormData(target);
    }

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
    }

    const request = new Request(url, {
      ...requestInit,
      headers,
      body,
      method,
      signal,
    });

    return {
      request,
      response: await fetch(request),
    };
  };
