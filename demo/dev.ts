import handler from "./handler.ts";
import init from "@http/host-deno-local/init";

await Deno.serve(await init(handler)).finished;
