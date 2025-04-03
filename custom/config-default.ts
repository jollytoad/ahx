import type { Config, ConfigKey } from "@ahx/types";

export const META_PREFIX = "ahx:";

export const DEFAULT_CONFIG: Config = {
  metaPrefix: META_PREFIX,
  onAttrPrefix: "on-",
  onCssPropPrefix: "--on-",
  eventPrefix: "",
  actionModulePrefix: "@ahx/actions/",
};

export function getConfig<K extends ConfigKey>(
  _node: unknown,
  ..._keys: K[]
): Pick<Config, K> {
  return DEFAULT_CONFIG;
}
