import { config } from "./config.ts";

export function applyUrlAttrs(elt: Element, loc: Location) {
  if (elt && elt.getAttribute(`${config.prefix}-url-href`) !== loc.href) {
    setAttr("href", loc.href);
    setAttr("host", loc.host);
    setAttr("path", loc.pathname);
    setAttr("search", loc.search);
    setAttr("hash", loc.hash);
  }

  function setAttr(prop: string, value?: string) {
    const attr = `${config.prefix}-url-${prop}`;
    if (value) {
      elt.setAttribute(attr, value);
    } else {
      elt.removeAttribute(attr);
    }
  }
}

export function initUrlAttrs(document: Document) {
  function listener() {
    applyUrlAttrs(document.documentElement, document.location);
  }

  [
    "DOMContentLoaded",
    "load",
    "hashchange",
    "popstate",
  ]
    .forEach((event) => {
      addEventListener(event, listener);
    });

  listener();
}
