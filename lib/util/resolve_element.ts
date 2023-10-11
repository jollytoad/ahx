/**
 * Resolve a given object to the most appropriate element, usually for triggering an event on.
 */
export function resolveElement(
  origin: CSSRule | CSSStyleSheet | Element | null,
): Element | undefined {
  if (origin instanceof Element) {
    return origin;
  }
  if (
    origin && "ownerNode" in origin && origin.ownerNode &&
    origin.ownerNode instanceof Element
  ) {
    return origin.ownerNode;
  }
  if (origin?.parentStyleSheet) {
    return resolveElement(origin.parentStyleSheet);
  }
  if (origin && "ownerRule" in origin) {
    return resolveElement(origin.ownerRule);
  }
}
