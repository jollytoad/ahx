/**
 * NOTE: `ActionEvent` used to be a class extending `Event`, but this causes
 * problems when used within a content script in a Firefox browser extension,
 * so it was changed to a CustomEvent with the ActionContext as detail, and
 * using a WeakMap to cache results against the event.
 *
 * @module
 */
import type { ActionContext, ActionResult } from "@ahx/types";

export type ActionEvent = CustomEvent<ActionContext>;

const eventResultsMap = new WeakMap<
  ActionEvent,
  Promise<ActionResult | void>[]
>();

export function addActionEventResult(
  event: ActionEvent,
  result: Promise<ActionResult | void>,
) {
  const results = eventResultsMap.get(event);
  results?.push(result);
}

async function getResults(event: ActionEvent): Promise<ActionResult[]> {
  const promises = eventResultsMap.get(event);
  if (promises) {
    const results = await Promise.all(promises);
    return results.filter((v) => !!v);
  }
  return [];
}

export function isActionEvent(event: unknown): event is ActionEvent {
  return eventResultsMap.has(event as ActionEvent);
}

export async function dispatchActionEvent(
  phase: "before" | "after",
  context: ActionContext,
  root: ParentNode,
  eventPrefix: string,
): Promise<ActionResult | void> {
  const eventType = context.event.type;
  if (
    context.action &&
    !eventType.startsWith(`${eventPrefix}before-`) &&
    !eventType.startsWith(`${eventPrefix}after-`)
  ) {
    const eventType = `${eventPrefix}${phase}-${context.action?.name}`;

    // NOTE: cloneInto of context is required in Firefox browser extensions only, otherwise the detail becomes inaccessible to us!
    const detail: ActionContext = "cloneInto" in globalThis
      // @ts-ignore: for Firefox browser ext only
      ? cloneInto(context, window, {
        wrapReflectors: true,
        cloneFunctions: true,
      })
      : context;

    const event = new CustomEvent<ActionContext>(eventType, {
      bubbles: false,
      cancelable: true,
      composed: false,
      detail,
    });

    eventResultsMap.set(event, []);

    try {
      const cancelled = !root.dispatchEvent(event);
      if (cancelled) {
        return { break: true };
      }

      const results = await getResults(event);

      if (results?.length) {
        return Object.assign({}, ...results);
      }
    } finally {
      eventResultsMap.delete(event);
    }
  }
  return;
}
