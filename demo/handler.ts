import { handle } from "$http_fns/handle.ts";
import { staticRoute } from "$http_fns/static.ts";
import { interceptResponse, skip } from "$http_fns/intercept.ts";

export default handle([
  interceptResponse(
    staticRoute("/", import.meta.resolve("../dist")),
    skip(404),
  ),
  staticRoute("/", import.meta.resolve("./")),
]);
