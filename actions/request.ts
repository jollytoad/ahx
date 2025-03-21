import type { ActionConstruct, ActionResult } from "@ahx/types";

type MethodName = "get" | "query" | "put" | "post" | "patch" | "delete";

const fetchAction =
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

export const get: ActionConstruct = fetchAction("get", false);
export const query: ActionConstruct = fetchAction("query", true);
export const put: ActionConstruct = fetchAction("put", true);
export const post: ActionConstruct = fetchAction("post", true);
export const patch: ActionConstruct = fetchAction("patch", true);

// You can't have a const named `delete`
const delete_: ActionConstruct = fetchAction("delete", false);
export { delete_ as delete };

export const header: ActionConstruct = (...args) => {
  if (!args[0] && !args[1]) {
    throw new TypeError("A header name and value is required");
  }
  const name = args[0]!;
  const value = args.slice(1).join(" ");

  return ({ request }) => {
    if (request instanceof Request) {
      request = undefined;
    }
    request ??= {};
    request.headers ??= new Headers();
    if (!(request.headers instanceof Headers)) {
      request.headers = new Headers(request.headers);
    }
    request.headers.append(name, value);

    return { request };
  };
};
