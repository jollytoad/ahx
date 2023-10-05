import { config } from "./config.ts";
import type { EventType, TriggerOrigin } from "./types.ts";

export function initLoadTriggerHandling(document: Document) {
  document.addEventListener(`${config.prefix}:addEventType`, (event) => {
    if (event.detail.eventType === "load") {
      // Listener for new ahx-trigger attributes with the 'load' event,
      // and trigger the event immediately
      document.addEventListener(`${config.prefix}:addTrigger:done`, (event) => {
        console.log("HERE1", event);
        const { trigger, origin } = event.detail;
        if (trigger.eventType === "load") {
          dispatchLoad(resolveTargets(origin), { triggerEvent: event.type });
        }
      });

      // Trigger a 'load' event on the root element and recursively on all
      // appropriate descendants after initial processing
      document.addEventListener(
        `${config.prefix}:processElements:done`,
        (event) => {
          console.log("HERE2", event);
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
        console.log("HERE3", event);
        dispatchLoad([...event.detail.addedElements], {
          triggerEvent: event.type,
        });
      });
    }
  });
}

function resolveTargets(origin: TriggerOrigin): EventTarget[] {
  if (origin instanceof Element) {
    return [origin];
  } else if (origin instanceof CSSStyleRule) {
    return [...document.querySelectorAll(origin.selectorText)];
  }
  return [];
}

function dispatchLoad(
  targets: EventTarget[],
  detail: { triggerEvent: EventType; recursive?: boolean },
) {
  if (targets.length) {
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
}
