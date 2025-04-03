/**
 * Configuration for ahx.
 *
 * A custom config is really only required if you need to avoid
 * conflicting with existing names.
 */
export interface Config {
  /**
   * The prefix that was used for <meta> names that define ahx config values.
   */
  metaPrefix: string;

  /**
   * Prefix for attributes that declare the event pipelines:
   * So we'll look for attributes that match: `<attrPrefix>-<eventType>`
   * Defaults to `on-`
   */
  onAttrPrefix: string;

  /**
   * Prefix for css properties that declare event pipelines:
   * So we'll look for css properties that match: `--<cssPropPrefix>-<eventType>`
   * Defaults to `--on-`
   */
  onCssPropPrefix: string;

  /**
   * Prefix for all custom events that we dispatch, eg. ready, setup, teardown
   * Defaults to `` (empty string)
   */
  eventPrefix: string;

  /**
   * Prefix to prepend to an action name to form
   * a bare module specifier that will be resolved
   * against the import map.
   * Defaults to `@ahx/actions/`
   */
  actionModulePrefix: string;
}

export type ConfigKey = keyof Config;
