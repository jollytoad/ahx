import type { ActionContext, ActionResult } from "@ahx/types";

export interface ActionEventInit extends EventInit {
  context: ActionContext;
}

export class ActionEvent extends Event {
  context: ActionContext;
  #results?: Promise<ActionResult | void>[];

  constructor(type: string, { context, ...init }: ActionEventInit) {
    super(type, {
      bubbles: false,
      cancelable: true,
      composed: false,
      ...init,
    });
    this.context = context;
  }

  addResult(result: Promise<ActionResult | void>): void {
    (this.#results ??= []).push(result);
  }

  async getResults(): Promise<ActionResult[] | void> {
    if (this.#results) {
      const results = await Promise.all(this.#results);
      return results.filter((v) => !!v);
    }
    return;
  }
}

export function isActionEvent(event: unknown): event is ActionEvent {
  return event instanceof ActionEvent;
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
    const event = new ActionEvent(eventType, { context });
    const cancelled = !root.dispatchEvent(event);
    if (cancelled) {
      return { break: true };
    }
    const results = await event.getResults();
    if (results?.length) {
      return Object.assign({}, ...results);
    }
  }
  return;
}
