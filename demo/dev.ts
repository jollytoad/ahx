import handler from "./handler.ts";
import { build } from "../scripts/build.ts";
import init from "$http_fns/hosting/init_localhost.ts";

await build({ watch: true });

await Deno.serve(await init(handler)).finished;
