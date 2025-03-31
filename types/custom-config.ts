import type { Config, ConfigKey } from "./config.ts";

/**
 * The expected exports of `@ahx/custom/config.ts`
 */
export interface ConfigModule {
  getConfig<K extends ConfigKey>(node: unknown, ...keys: K[]): Pick<Config, K>;
}
