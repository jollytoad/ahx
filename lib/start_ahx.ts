import { startObserver } from "./start_observer.ts";
import { processElements } from "./process_elements.ts";
import { processRules } from "./process_rules.ts";
import { initUrlAttrs } from "./url_attrs.ts";
import { triggerLoad } from "./trigger_load.ts";
import { initDebug } from "./debug/init.ts";

export function startAhx(doc: Document) {
  initDebug(doc);
  initUrlAttrs(doc);
  startObserver(doc);
  processRules(doc);
  processElements(doc);
  triggerLoad(doc.documentElement);
}
