const eventResultsMap = new WeakMap();
export function addActionEventResult(
  event,
  result,
) {
  const results = eventResultsMap.get(event);
  results?.push(result);
}
async function getResults(event) {
  const promises = eventResultsMap.get(event);
  if (promises) {
    const results = await Promise.all(promises);
    return results.filter((v) => !!v);
  }
  return [];
}
export function isActionEvent(event) {
  return eventResultsMap.has(event);
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
        const detail = "cloneInto" in globalThis
      // @ts-ignore: for Firefox browser ext only
      ? cloneInto(context, window, {
        wrapReflectors: true,
        cloneFunctions: true,
      })
      : context;
    const event = new CustomEvent(eventType, {
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
