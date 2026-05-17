import { handle } from "@http/route/handle";
import { staticRoute } from "@http/route/static-route";
import { interceptResponse } from "@http/interceptor/intercept-response";
import { skip } from "@http/interceptor/skip";
import { byPattern } from "@http/route/by-pattern";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import { setHeaders } from "@http/response/set-headers";
import { appendHeaders } from "@http/response/append-headers";
import { prerender } from "@ahx/prerender/interceptor.ts";
import type { ResponseInterceptor } from "@http/interceptor/types";
import type { RequestHandler } from "@http/route/types";

const HTML_HEADERS: HeadersInit = [
  ["link", `</inject-ahx.js>; rel=preload; as=script`],
  ["link", `<https://cdn.jsdelivr.net>; rel=preconnect`],
  [
    "link",
    `<https://cdn.jsdelivr.net/npm/missing.css@1.3.0/dist/missing.min.css>; rel=preload; as=style`,
  ],
];

const DEVTOOLS = {
  workspace: {
    root: import.meta.dirname,
    uuid: "7c04cabd-59e6-42b7-9557-e18d1ca765f9",
  },
};

export default handle([
  byPattern(
    "/.well-known/appspecific/com.chrome.devtools.json",
    () => Response.json(DEVTOOLS),
  ),
  byPattern(
    "/importmap.json",
    async () => {
      const { default: importmap } = await import("./importmap.json", {
        with: { type: "json" },
      });
      if (Deno.env.has("AHX_URL")) {
        importmap.imports["@ahx/"] = Deno.env.get("AHX_URL")!;
      }
      return Response.json(importmap);
    },
  ),
  ...addFolder("/examples", import.meta.resolve("./examples/")),
  interceptResponse(
    staticRoute("/docs/action", import.meta.resolve("../actions/")),
    skip(404),
  ),
  ...addFolder("/docs", import.meta.resolve("./docs/")),
  interceptResponse(
    staticRoute("/@ahx", import.meta.resolve("../dist/@ahx/")),
    skip(404),
  ),
  interceptResponse(
    staticRoute("/@ahx", import.meta.resolve("../")),
    (_req, res) => {
      if (res?.headers.get("content-type") === "video/mp2t") {
        return setHeaders(res, { "content-type": "application/typescript" });
      }
    },
  ),
  staticRoute("/", import.meta.resolve("./")),
]);

function addFolder(pattern: string, fileRootUrl: string): RequestHandler[] {
  return [
    dynamicRoute({
      pattern,
      fileRootUrl,
      eagerness: "request",
      routeMapper({ ext, pattern, module }) {
        if (pattern.endsWith(".route") && (ext === ".ts" || ext === ".tsx")) {
          switch (ext) {
            case ".ts":
            case ".tsx":
              return [{
                pattern: pattern.replace(/\.route$/, ""),
                module,
              }];
          }
        }
        return [];
      },
      verbose: true,
    }),
    interceptResponse(
      staticRoute(pattern, fileRootUrl, {
        showIndex: true,
      }),
      prerender(Deno.args.includes("--prerender")),
      addLinkHeaders(),
    ),
  ];
}

function addLinkHeaders(): ResponseInterceptor {
  return (_req, res) => {
    if (res?.headers.get("content-type")?.startsWith("text/html")) {
      return appendHeaders(res, HTML_HEADERS);
    }
    return res;
  };
}
