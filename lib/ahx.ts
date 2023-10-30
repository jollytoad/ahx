/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>
/// <reference lib="dom.asynciterable"/>

import { ready } from "./ready.ts";
import { startObserver } from "./start_observer.ts";
import { processElements } from "./process_elements.ts";
import { processRules } from "./process_rules.ts";
import * as ahx from "./debug.ts";
import { initUrlAttrs } from "./url_attrs.ts";
import { triggerLoad } from "./trigger_load.ts";

ready((document) => {
  initUrlAttrs(document);

  startObserver(document);

  processRules(document);

  processElements(document);

  triggerLoad(document.documentElement);
});

// deno-lint-ignore no-explicit-any
(window as any).ahx = ahx;
