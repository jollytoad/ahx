

export const META_PREFIX = "ahx:";

export const DEFAULT_CONFIG = {
  metaPrefix: META_PREFIX,
  onAttrPrefix: "on-",
  onCssPropPrefix: "--on-",
  eventPrefix: "",
  actionModulePrefix: "@ahx/actions/",
};

export function getConfig(
  _node,
  ..._keys
) {
  return DEFAULT_CONFIG;
}
