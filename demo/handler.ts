import { handle } from "@http/route/handle";
import { staticRoute } from "@http/route/static-route";
import { interceptResponse } from "@http/interceptor/intercept-response";
import { skip } from "@http/interceptor/skip";
import { byPattern } from "@http/route/by-pattern";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import { setHeaders } from "@http/response/set-headers";
import { serveFile } from "@http/fs/serve-file";
import { fromFileUrl } from "@std/path/from-file-url";

export default handle([
  byPattern("/huge", () => {
    return new Response(
      ReadableStream.from(huge()).pipeThrough(new TextEncoderStream()),
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }),
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
  byPattern(
    "/examples",
    (req) =>
      serveFile(
        req,
        fromFileUrl(import.meta.resolve("./examples/index.html")),
      ),
  ),
  dynamicRoute({
    pattern: "/examples",
    fileRootUrl: import.meta.resolve("./examples"),
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
  staticRoute("/examples", import.meta.resolve("./examples"), {
    showIndex: true,
  }),
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

async function* huge() {
  yield "<!DOCTYPE html>\n";
  for (let count = 1; count < 100; count += 2) {
    yield `<div>This is line <b>${count}</b></div><div>This is line <b>${
      count + 1
    }</b></div>\n`;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
