import { config } from "./config.ts";
import type { EventType } from "./types.ts";

export function initLoadTriggerHandling(document: Document) {
  document.addEventListener(`${config.prefix}:addEventType`, (event) => {
    if (event.detail.eventType === "load") {
      // Listener for new ahx-trigger attributes with the 'load' event,
      // and trigger the event immediately
      document.addEventListener(`${config.prefix}:addTrigger:done`, (event) => {
        if (event.detail.trigger.eventType === "load" && event.target) {
          dispatchLoad([event.target], { triggerEvent: event.type });
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

            dispatchLoad([target], {
              triggerEvent: event.type,
              recursive: true,
            });
          }
        },
      );

      // Trigger a 'load' event on all newly added elements
      document.addEventListener(`${config.prefix}:mutations:done`, (event) => {
        dispatchLoad([...event.detail.addedElements], {
          triggerEvent: event.type,
        });
      });
    }
  });
}

function dispatchLoad(
  targets: EventTarget[],
  detail: { triggerEvent: EventType; recursive?: boolean },
) {
  setTimeout(() => {
    for (const elt of targets) {
      elt.dispatchEvent(
        new CustomEvent("load", {
          bubbles: true,
          detail,
        }),
      );
    }
  }, 0);
}
