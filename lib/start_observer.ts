import { deleteInternal } from "./internal.ts";
import { processElement } from "./process_element.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { processElements } from "./process_elements.ts";

export function startObserver(root: ParentNode) {
  const observer = new MutationObserver((mutations) => {
    const detail = { mutations };
    if (dispatchBefore(root, "mutations", detail)) {
      const removedNodes = new Set<Node>();
      const removedElements: Element[] = [];
      const addedElements: Element[] = [];

      for (const mutation of detail.mutations) {
        for (const node of mutation.removedNodes) {
          removedNodes.add(node);
          if (node instanceof Element) {
            removedElements.push(node);
          }
        }

        for (const node of mutation.addedNodes) {
          removedNodes.delete(node);
          if (node instanceof Element) {
            processElements(node);
            addedElements.push(node);
          }
        }

        if (
          mutation.type === "attributes" && mutation.target instanceof Element
        ) {
          processElement(mutation.target);
        }
      }

      dispatchAfter(root, "mutations", {
        ...detail,
        removedElements,
        addedElements,
      });

      for (const node of removedNodes) {
        deleteInternal(node);
      }
    }
  });

  const options: MutationObserverInit = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
  };

  if (dispatchBefore(root, "startObserver", options)) {
    observer.observe(root, options);

    dispatchAfter(root, "startObserver", options);
  }
}
