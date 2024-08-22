import handler from "./handler.ts";
import { build } from "../scripts/build.ts";
import init from "@http/host-deno-local/init";

await build({ watch: true });

await Deno.serve(await init(handler)).finished;
