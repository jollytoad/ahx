/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>
/// <reference lib="dom.asynciterable"/>

import { ready } from "./ready.ts";
import { startObserver } from "./start_observer.ts";
import { eventsAll } from "./debug/events.ts";
import { processTree } from "./process_tree.ts";
import { processStyleSheets } from "./process_stylesheets.ts";
import { initLoadTriggerHandling } from "./trigger_load.ts";
import * as ahx from "./debug.ts";
import { patchCSSOM } from "./cssom_patch.ts";
import { processValues } from "./process_value.ts";

// ahx.loggerConfig.include = ["processValue", "updateForm"];

// TODO: Combine this into the observer, maybe create a CssMutationObserver?
patchCSSOM({
  onInsertRule() {
    setTimeout(() => {
      processStyleSheets(document);
    }, 0);
  },
});

ready((document) => {
  eventsAll(document);

  initLoadTriggerHandling(document);

  startObserver(document);

  processStyleSheets(document);

  processValues(document);

  processTree(document);
});

// deno-lint-ignore no-explicit-any
(window as any).ahx = ahx;
