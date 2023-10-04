import { getInternal, hasInternal, setInternal } from "./internal.ts";
import type { Owner } from "./types.ts";

export function getOwner(origin: CSSRule | StyleSheet | Element) {
  if (hasInternal(origin, "owner")) {
    return getInternal(origin, "owner");
  }

  if (origin instanceof StyleSheet) {
    return getInternal(origin, "owner") ?? origin.href ?? undefined;
  }

  if (origin instanceof CSSRule && origin.parentStyleSheet) {
    return getOwner(origin.parentStyleSheet);
  }

  if (origin instanceof Element && origin.parentElement) {
    return getOwner(origin.parentElement);
  }
}

export function setOwner(origin: CSSRule | StyleSheet | Element, owner: Owner) {
  if (owner !== getOwner(origin)) {
    setInternal(origin, "owner", owner);
  }
}
