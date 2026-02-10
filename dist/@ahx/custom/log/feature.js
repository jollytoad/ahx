
import { PREFIX } from "./config.js";

const BOLD = "font-weight: bold;";
const RESET = "font-weight: normal;";

const loggedCache = new Set();

export function featureOutcome(
  outcome,
  sep,
) {
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
