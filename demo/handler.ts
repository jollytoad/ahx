import { handle } from "@http/route/handle";
import { staticRoute } from "@http/route/static-route";
import { interceptResponse } from "@http/interceptor/intercept-response";
import { skip } from "@http/interceptor/skip";
import { byPattern } from "@http/route/by-pattern";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import { lazy } from "@http/route/lazy";

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
  byPattern("/test", lazy(() => import("../test/index.ts"))),
  dynamicRoute({
    pattern: "/test",
    fileRootUrl: import.meta.resolve("../test"),
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
  staticRoute("/test", import.meta.resolve("../test")),
  interceptResponse(
    staticRoute("/", import.meta.resolve("../dist")),
    skip(404),
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
