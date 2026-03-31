import type { ActionConstruct, ActionResult } from "@ahx/types";
import { getBaseURL } from "./base-url.ts";

const bodyMethods = new Set(["query", "put", "post", "patch"]);

export const fetchAction =
  (methodArg?: string): ActionConstruct =>
  (urlArg?: string) =>
  async (context): Promise<ActionResult> => {
    const {
      control,
      action,
      index,
      signal,
      request: requestInit,
      jsonData,
      formData,
      trace,
    } = context;

    const method = methodArg ?? requestInit?.method ?? "get";
    let url: string | URL | undefined = urlArg ?? requestInit?.url;
    const headers = new Headers(requestInit?.headers);
    let body: BodyInit | ReadableStream<Uint8Array> | null | undefined =
      requestInit?.body;

    if (!url) {
      throw new Error("No URL available for request");
    }

    const isBodyMethod = bodyMethods.has(method.toLowerCase());

    url = new URL(url, getBaseURL(context));

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
