import handler from "./handler.ts";
import { build } from "../scripts/build.ts";
import init from "$http_fns/hosting/localhost.ts";

await build({ watch: true });

await Deno.serve(await init(handler)).finished;
