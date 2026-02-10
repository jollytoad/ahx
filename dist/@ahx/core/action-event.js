

export class ActionEvent extends Event {
  context;
  #results;

  constructor(type, { context, ...init }) {
    super(type, {
      bubbles: false,
      cancelable: true,
      composed: false,
      ...init,
    });
    this.context = context;
  }

  addResult(result) {
    (this.#results ??= []).push(result);
  }

  async getResults() {
    if (this.#results) {
      const results = await Promise.all(this.#results);
      return results.filter((v) => !!v);
    }
    return;
  }
}

export function isActionEvent(event) {
  return event instanceof ActionEvent;
}

export async function dispatchActionEvent(
  phase,
  context,
  root,
  eventPrefix,
) {
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
