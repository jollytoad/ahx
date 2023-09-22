import { ahxSelector } from "./attributes.ts";
import { processElement } from "./process_element.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { AhxRule } from "./types.ts";

export function processTree(root: ParentNode): AhxRule[] {
  const detail = {
    selector: ahxSelector(),
  };

  if (triggerBeforeEvent(root, "processTree", detail)) {
    const addedRules: AhxRule[] = [];
    const elements = root.querySelectorAll(detail.selector);

    for (const elt of elements) {
      addedRules.push(...processElement(elt));
    }

    triggerAfterEvent(root, "processTree", {
      ...detail,
      addedRules,
      removedRules: [],
    });

    return addedRules;
  }

  return [];
}
