import { config } from "./config.ts";

export function initLoadTriggerHandling(document: Document) {
  document.addEventListener(`${config.prefix}:addEventType`, (event) => {
    // At least one ahx rule has registered an interest in the 'load' event
    if (event.detail.eventType === "load") {
      // Listener for new ahx-trigger attributes with the 'load' event,
      // and trigger the event immediately
      document.addEventListener(`${config.prefix}:addRule:done`, (event) => {
        if (
          "trigger" in event.detail && event.detail.trigger.eventType === "load"
        ) {
          const origin = event.detail.origin.deref();

          if (origin instanceof Element) {
            origin.dispatchEvent(
              new CustomEvent("load", {
                bubbles: true,
              }),
            );
          }
        }
      });

      // Trigger a 'load' event on the root element and recursively on all
      // appropriate descendants after initial processing
      document.addEventListener(
        `${config.prefix}:processTree:done`,
        (event) => {
          if (event.target) {
            const target = event.target instanceof Document
              ? event.target.documentElement
              : event.target;

            target.dispatchEvent(
              new CustomEvent("load", {
                bubbles: true,
                detail: {
                  recursive: true,
                },
              }),
            );
          }
        },
      );

      // Trigger a 'load' event on all newly added elements
      document.addEventListener(`${config.prefix}:mutations:done`, (event) => {
        for (const elt of event.detail.addedElements) {
          elt.dispatchEvent(
            new CustomEvent("load", {
              bubbles: true,
            }),
          );
        }
      });
    }
  });
}
