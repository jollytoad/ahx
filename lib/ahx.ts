/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>
/// <reference lib="dom.asynciterable"/>

import { ready } from "./ready.ts";
import { startObserver } from "./start_observer.ts";
import { logAll } from "./logger.ts";
import { processTree } from "./process_tree.ts";
import { processStyleSheets } from "./process_stylesheets.ts";
import { initLoadTriggerHandling } from "./trigger_load.ts";
import * as ahx from "./debug.ts";

ready((document) => {
  logAll(document);

  initLoadTriggerHandling(document);

  startObserver(document);

  processStyleSheets(document);

  processTree(document);
});

// deno-lint-ignore no-explicit-any
(window as any).ahx = ahx;
