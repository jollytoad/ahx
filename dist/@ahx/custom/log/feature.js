
import { PREFIX } from "./config.js";

const BOLD = "font-weight: bold;";
const RESET = "font-weight: normal;";

const loggedImportCache = new Set();

export function importFeature(
  outcome,
  sep = "-",
) {
  const { moduleBinding, exportBinding, exportName, moduleUrl } = outcome;
  const kind = outcome.feature.kind;

  const actionBinding =
    (exportBinding && exportBinding.length > moduleBinding.length
      ? exportBinding
      : moduleBinding).join(sep);

  if (loggedImportCache.has(actionBinding)) return;

  loggedImportCache.add(actionBinding);

  console.debug(
    `${PREFIX}imported %s "%c%s%c" from "%c%s()%c" in "%s"`,
    kind ?? "unknown",
    BOLD,
    actionBinding,
    RESET,
    BOLD,
    exportName,
    RESET,
    moduleUrl,
  );
}
