/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>
/// <reference lib="dom.asynciterable"/>

import { ready } from "./ready.ts";
import { startObserver } from "./start_observer.ts";
import { eventsAll } from "./debug/events.ts";
import { processElements } from "./process_elements.ts";
import { processRules } from "./process_rules.ts";
import { initLoadTriggerHandling } from "./trigger_load.ts";
import * as ahx from "./debug.ts";
import { patchCSSOM } from "./cssom_patch.ts";
import { initUrlAttrs } from "./url_attrs.ts";
import { processRule } from "./process_rule.ts";

// ahx.loggerConfig.include = ["processValue", "updateForm"];

// TODO: Combine this into the observer, maybe create a CssMutationObserver?
patchCSSOM({
  onInsertRule(_parent, rule) {
    if (rule instanceof CSSStyleRule) {
      setTimeout(() => {
        processRule(rule);
      }, 1);
    }
  },
});

ready((document) => {
  eventsAll();

  initUrlAttrs(document);

  initLoadTriggerHandling(document);

  startObserver(document);

  processRules(document);

  processElements(document);
});

// deno-lint-ignore no-explicit-any
(window as any).ahx = ahx;
