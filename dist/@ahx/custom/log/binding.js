
import { PREFIX } from "./config.js";

const BOLD = "font-weight: bold;";
const RESET = "font-weight: normal;";

const loggedCache = new Set();

export function bindingOutcome(
  outcome,
  sep,
) {
  if (outcome.status === "notFound" || outcome.status === "ignored") {
    const { moduleBinding } = outcome;
    const kind = outcome.feature.kind ?? "unknown";

    const binding = moduleBinding?.join(sep);

    if (binding) {
      const cacheKey = `${kind}:${binding}`;
      if (loggedCache.has(cacheKey)) return;
      loggedCache.add(cacheKey);

      const method = outcome.status === "notFound" ? "warn" : "debug";

      console[method](
        `${PREFIX}binding %s "%c%s%c" %s`,
        kind,
        BOLD,
        binding,
        RESET,
        outcome.status,
      );
    }
  }
}
