import { handle } from "$http_fns/handle.ts";
import { staticRoute } from "$http_fns/static.ts";
import { interceptResponse, skip } from "$http_fns/intercept.ts";
import { byPattern } from "$http_fns/pattern.ts";

export default handle([
  byPattern("/huge", () => {
    return new Response(
      // @ts-expect-error ReadableStream.from seems to be missing!
      ReadableStream.from(huge()).pipeThrough(new TextEncoderStream()),
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }),
  staticRoute("/tests", import.meta.resolve("../tests")),
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
