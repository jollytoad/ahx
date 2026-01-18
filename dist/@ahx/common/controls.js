

const indexed = new WeakMap();

export async function getControl(
  source,
  eventType,
) {
  return (await indexed.get(source)?.get(eventType))?.deref();
}

export function getEventTypes(
  source,
) {
  return indexed.get(source)?.keys() ?? [];
}

export function storeControl(
  source,
  eventType,
  control,
) {
  let controls = indexed.get(source);
  if (!controls) {
    indexed.set(source, controls = new Map());
  }
  controls.set(
    eventType,
    control.then((control) => control ? new WeakRef(control) : undefined),
  );
  return control;
}
