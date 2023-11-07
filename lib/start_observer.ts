import { deleteInternal } from "./util/internal.ts";
import { processElement } from "./process_element.ts";
import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import { processElements } from "./process_elements.ts";
import { triggerMutate } from "./trigger_mutate.ts";
import { triggerLoad } from "./trigger_load.ts";
import { processRules } from "./process_rules.ts";
import { processQueue } from "./process_queue.ts";

export function startObserver(root: Document) {
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

      processRules(root);

      processQueue();

      dispatchAfter(root, "mutations", {
        ...detail,
        removedElements,
        addedElements,
        mutatedElements,
      });

      for (const node of removedNodes) {
        deleteInternalRecursive(node);
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

function deleteInternalRecursive(node: Node) {
  deleteInternal(node);
  for (const child of node.childNodes) {
    deleteInternalRecursive(child);
  }
}
