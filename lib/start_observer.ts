import { deleteInternal } from "./util/internal.ts";
import { processElement } from "./process_element.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { processElements } from "./process_elements.ts";
import { triggerMutate } from "./trigger_mutate.ts";
import { triggerLoad } from "./trigger_load.ts";

export function startObserver(root: ParentNode) {
  const observer = new MutationObserver((mutations) => {
    const detail = { mutations };
    if (dispatchBefore(root, "mutations", detail)) {
      const removedNodes = new Set<Node>();
      const removedElements = new Set<Element>();
      const addedElements = new Set<Element>();
      const mutatedElements = new Set<Element>();

      for (const mutation of detail.mutations) {
        for (const node of mutation.removedNodes) {
          removedNodes.add(node);
          if (node instanceof Element) {
            removedElements.add(node);
          }
        }

        for (const node of mutation.addedNodes) {
          removedNodes.delete(node);
          if (node instanceof Element) {
            processElements(node);
            addedElements.add(node);
          }
        }

        if (
          mutation.type === "attributes" && mutation.target instanceof Element
        ) {
          processElement(mutation.target);
        }

        if (mutation.target instanceof Element) {
          mutatedElements.add(mutation.target);
        }
      }

      dispatchAfter(root, "mutations", {
        ...detail,
        removedElements,
        addedElements,
        mutatedElements,
      });

      for (const node of removedNodes) {
        deleteInternal(node);
      }

      setTimeout(() => {
        for (const elt of mutatedElements) {
          triggerMutate(elt);
        }
      }, 0);

      setTimeout(() => {
        for (const elt of addedElements) {
          triggerLoad(elt);
        }
      });
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
