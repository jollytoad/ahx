/**
 * Resolve a given object to the most appropriate element, usually for triggering an event on.
 */
export function resolveElement(
  thing: CSSRule | CSSStyleSheet | Element | null,
): Element | undefined {
  if (thing instanceof Element) {
    return thing;
  }
  if (
    thing && "ownerNode" in thing && thing.ownerNode &&
    thing.ownerNode instanceof Element
  ) {
    return thing.ownerNode;
  }
  if (thing?.parentStyleSheet) {
    return resolveElement(thing.parentStyleSheet);
  }
  if (thing && "ownerRule" in thing) {
    return resolveElement(thing.ownerRule);
  }
}
