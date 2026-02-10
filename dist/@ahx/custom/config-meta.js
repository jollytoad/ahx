
import { DEFAULT_CONFIG, META_PREFIX } from "./config-default.js";
import { isAttr, isDocument, isElement, isNode } from "@ahx/common/guards.js";

const documentConfigCache = new WeakMap();

export function getConfig(
  node,
  ...keys
) {
  const config = documentConfig(document);
  const exclude = new Set();

  if (isAttr(node)) {
    node = node.ownerElement;
  }
  if (isNode(node) && !isElement(node)) {
    node = node.parentElement ?? node.parentNode ?? null;
  }

  return Object.fromEntries(
    keys.flatMap((key) => exclude.has(key) ? [] : [[key, config[key]]]),
  );
}

function documentConfig(node) {
  const document = isDocument(node)
    ? node
    : isNode(node)
    ? node.ownerDocument
    : null;
  if (!document) return DEFAULT_CONFIG;
  let config = documentConfigCache.get(document);
  if (!config) {
    config = Object.fromEntries(
      Object.entries(DEFAULT_CONFIG).map((
        [key, value],
      ) => [key, fromMeta(document, key, value)]),
    );
    documentConfigCache.set(document, config);
  }
  return config;
}

function fromMeta(
  document,
  name,
  defaultValue,
) {
  return document.querySelector(`meta[name="${META_PREFIX}${name}"]`)
    ?.getAttribute("content") ?? defaultValue;
}
