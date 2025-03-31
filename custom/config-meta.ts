import type { Config, ConfigKey } from "@ahx/types";
import { DEFAULT_CONFIG, META_PREFIX } from "./config-default.ts";

const documentConfigCache = new WeakMap<Document, Config>();

export function getConfig<K extends ConfigKey>(
  node: unknown,
  ...keys: K[]
): Pick<Config, K> {
  const config = documentConfig(document);
  const exclude = new Set<ConfigKey>();

  if (node instanceof Attr) {
    node = node.ownerElement;
  }
  if (node instanceof Node && !(node instanceof Element)) {
    node = node.parentElement ?? node.parentNode ?? null;
  }

  return Object.fromEntries(
    keys.flatMap((key) => exclude.has(key) ? [] : [[key, config[key]]]),
  ) as Pick<Config, K>;
}

function documentConfig(node: unknown): Config {
  const document = node instanceof Document
    ? node
    : node instanceof Node
    ? node.ownerDocument
    : null;
  if (!document) return DEFAULT_CONFIG;
  let config = documentConfigCache.get(document);
  if (!config) {
    config = Object.fromEntries(
      Object.entries(DEFAULT_CONFIG).map((
        [key, value],
      ) => [key, fromMeta(document, key, value)]),
    ) as unknown as Config;
    documentConfigCache.set(document, config);
  }
  return config;
}

function fromMeta(
  document: Document,
  name: string,
  defaultValue: string,
): string {
  return document.querySelector(`meta[name="${META_PREFIX}${name}"]`)
    ?.getAttribute("content") ?? defaultValue;
}
