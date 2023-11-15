/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>
/// <reference lib="dom.asynciterable"/>

import { ready } from "./ready.ts";
import * as ahx from "./debug.ts";
import { startAhx } from "./start_ahx.ts";

ready(startAhx);

// deno-lint-ignore no-explicit-any
(window as any).ahx = ahx;
