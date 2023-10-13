import { getInternal, hasInternal, setInternal } from "./internal.ts";
import type { Owner } from "../types.ts";

export function getOwner(thing: CSSRule | StyleSheet | Element) {
  if (hasInternal(thing, "owner")) {
    return getInternal(thing, "owner");
  }

  if (thing instanceof StyleSheet) {
    return getInternal(thing, "owner") ?? thing.href ?? undefined;
  }

  if (thing instanceof CSSRule && thing.parentStyleSheet) {
    return getOwner(thing.parentStyleSheet);
  }

  if (thing instanceof Element && thing.parentElement) {
    return getOwner(thing.parentElement);
  }
}

export function setOwner(thing: CSSRule | StyleSheet | Element, owner: Owner) {
  // TODO: dispatch ahx:setOwner event?
  if (owner !== getOwner(thing)) {
    setInternal(thing, "owner", owner);
  }
}
