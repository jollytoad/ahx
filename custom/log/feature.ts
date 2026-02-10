import type { Feature, FeatureOutcome } from "@ahx/types";
import { PREFIX } from "@ahx/custom/log/config.ts";

const BOLD = "font-weight: bold;";
const RESET = "font-weight: normal;";

const loggedCache = new Set<string>();

export function featureOutcome(
  outcome: FeatureOutcome<Feature, unknown>,
  sep: string,
): void {
  if (outcome.status === "loaded") {
    const { moduleBinding, exportBinding, exportName, moduleUrl } = outcome;
    const kind = outcome.feature.kind ?? "unknown";

    const longestBinding =
      (exportBinding && exportBinding.length > moduleBinding.length
        ? exportBinding
        : moduleBinding).join(sep);

    const cacheKey = `${kind}:${longestBinding}`;

    if (loggedCache.has(cacheKey)) return;

    loggedCache.add(cacheKey);

    console.debug(
      `${PREFIX}imported %s "%c%s%c" from "%c%s()%c" in "%s"`,
      kind,
      BOLD,
      longestBinding,
      RESET,
      BOLD,
      exportName,
      RESET,
      moduleUrl,
    );
  }
}
