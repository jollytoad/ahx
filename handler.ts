import { handle } from "$http_fns/handle.ts";
import { staticRoute } from "$http_fns/static.ts";

export default handle([
  staticRoute("/", import.meta.resolve("./")),
]);
