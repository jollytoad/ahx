import { processElement } from "./process_element.ts";
import { removeRules } from "./rules.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { AhxRule } from "./types.ts";

export function startObserver(root: ParentNode) {
  const observer = new MutationObserver((mutations) => {
    const detail = { mutations };
    if (triggerBeforeEvent(root, "mutations", detail)) {
      const removedRules: AhxRule[] = [];
      const addedRules: AhxRule[] = [];
      const removedElements: Element[] = [];
      const addedElements: Element[] = [];

      for (const mutation of detail.mutations) {
        for (const node of mutation.removedNodes) {
          if (node instanceof Element) {
            removedRules.push(...removeRules(node));
            removedElements.push(node);
          }
        }

        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            addedRules.push(...processElement(node));
            addedElements.push(node);
          }
        }

        if (
          mutation.type === "attributes" && mutation.target instanceof Element
        ) {
          removedRules.push(...removeRules(mutation.target));
          addedRules.push(...processElement(mutation.target));
        }
      }

      triggerAfterEvent(root, "mutations", {
        ...detail,
        removedRules,
        addedRules,
        removedElements,
        addedElements,
      });
    }
  });

  const options: MutationObserverInit = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
  };

  if (triggerBeforeEvent(root, "startObserver", options)) {
    observer.observe(root, options);

    triggerAfterEvent(root, "startObserver", options);
  }
}
