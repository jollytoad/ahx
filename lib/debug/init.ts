import { parseAttrValue } from "../parse_attr_value.ts";
import { asAhxAttributeName } from "../util/names.ts";
import { eventsAll, loggerConfig } from "./events.ts";

export function initDebug(document: Document) {
  const attrName = asAhxAttributeName("debug-events");
  const element = document.querySelector(`[${attrName}]`);
  if (element) {
    // deno-lint-ignore no-explicit-any
    loggerConfig.include = parseAttrValue(attrName, element) as any[];
    eventsAll();
  }
}
