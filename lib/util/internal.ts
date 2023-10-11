import type {
  CSSPropertyName,
  EventType,
  Owner,
  PseudoId,
  Trigger,
} from "../types.ts";

type Thing = Node | CSSRule | StyleSheet;

type TriggerProps = {
  [K in `trigger:${EventType}`]: Trigger;
};

interface Props extends TriggerProps {
  // CSSStyleRule
  "pseudoId": PseudoId;
  "importLinks": Map<CSSPropertyName, WeakRef<HTMLLinkElement>>;
  "denyTrigger": true;

  // Element
  "triggeredOnce": true;
  "delayed": ReturnType<typeof setTimeout>;
  "formData": FormData;

  // Common
  "owner": Owner;
}

export type Key = keyof Props;

const values = new Map<Key, WeakMap<Thing, Props[Key]>>();

// Maintain an iterable set of WeakRefs to the objects with internal properties
const weakRefs = new Set<WeakRef<Thing>>();
const toWeakRef = new WeakMap<Thing, WeakRef<Thing>>();

/**
 * Set an internal property associated with a DOM object
 */
export function setInternal<K extends Key>(
  obj: Thing,
  key: K,
  value: Props[K],
) {
  if (!values.has(key)) {
    values.set(key, new WeakMap());
  }

  values.get(key)!.set(obj, value);

  if (!toWeakRef.has(obj)) {
    const weakRef = new WeakRef(obj);
    weakRefs.add(weakRef);
    toWeakRef.set(obj, weakRef);
  }
}

/**
 * Get an internal property from a DOM object.
 * Optionally initializing that property if it doesn't already exist,
 * this is handy where the property is a Map or Set.
 */
export function getInternal<K extends Key>(
  obj: Thing,
  key: K,
  initializer: () => Props[K],
): Props[K];
export function getInternal<K extends Key>(
  obj: Thing,
  key: K,
): Props[K] | undefined;
export function getInternal<K extends Key>(
  obj: Thing,
  key: K,
  initializer?: () => Props[K],
): Props[K] | undefined {
  if (initializer && !hasInternal(obj, key)) {
    setInternal(obj, key, initializer());
  }
  return values.get(key)?.get(obj) as Props[K] | undefined;
}

/**
 * Check whether a internal property exists on a DOM object.
 */
export function hasInternal(obj: Thing, key: Key): boolean {
  return !!values.get(key)?.has(obj);
}

/**
 * Delete one or all internal properties from a DOM object.
 */
export function deleteInternal(obj: Thing, key?: Key): void {
  if (key) {
    values.get(key)?.delete(obj);
  } else {
    for (const valueMap of values.values()) {
      valueMap.delete(obj);
    }
    const weakRef = toWeakRef.get(obj);
    if (weakRef) {
      weakRefs.delete(weakRef);
      toWeakRef.delete(obj);
    }
  }
}

/**
 * Find all DOM objects that have a specific internal property set.
 * @returns tuples of the object and its property value
 */
export function* objectsWithInternal<K extends Key>(
  key: K,
): Iterable<[Thing, Props[K]]> {
  const valueMap = values.get(key);
  if (valueMap) {
    for (const weakRef of weakRefs) {
      const obj = weakRef.deref();
      if (obj && valueMap.has(obj)) {
        yield [obj, valueMap.get(obj) as Props[K]];
      }
    }
  }
}

/**
 * Iterate across all internal properties of all objects
 * @returns tuples of an object, property key, and property value on the object
 */
export function* internalEntries<K extends Key>(): Iterable<
  [Thing, K, Props[K]]
> {
  for (const weakRef of weakRefs) {
    const obj = weakRef.deref();
    if (obj) {
      for (const [key, valueMap] of values.entries()) {
        if (valueMap.has(obj)) {
          yield [obj, key as K, valueMap.get(obj) as Props[K]];
        }
      }
    }
  }
}
