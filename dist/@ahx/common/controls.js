

const indexed = new WeakMap();

const rules = new Set();

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
  indexed.getOrInsertComputed(source, () => new Map()).set(
    eventType,
    control.then((control) => control ? new WeakRef(control) : undefined),
  );
  control.then((control) => control && control.isRule && rules.add(control));
  return control;
}

export function* getRules(eventType) {
  for (const control of rules) {
    if (control.isDead()) {
      rules.delete(control);
    } else if (control.eventType === eventType) {
      yield control;
    }
  }
}
