import { config } from "./config.ts";

export function initLoadTriggerHandling(document: Document) {
  document.addEventListener(`${config.prefix}:addEventType`, (event) => {
    if (event.detail.eventType === "load") {
      document.addEventListener(`${config.prefix}:addRule:done`, (event) => {
        if (event.detail.trigger.eventType === "load") {
          const target = event.detail.target.deref();

          if (target instanceof Element) {
            target.dispatchEvent(
              new CustomEvent("load", {
                bubbles: true,
              }),
            );
          }
        }
      });

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
