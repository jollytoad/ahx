import type {
  Feature,
  FeatureInit,
  FeatureLoaded,
  FeatureLoader,
  FeatureLoaderOptions,
  FeatureOutcome,
} from "@ahx/types";

/**
 * Create a function for loading features from modules.
 * Attempts to find the module and export according to the bindings in the features.
 */
export function createFeatureLoader<
  F extends Feature = Feature,
  V = FeatureInit,
>(
  options: FeatureLoaderOptions<F, V> = {},
): FeatureLoader<F, V> {
  const {
    isValidExport = (detail): detail is FeatureLoaded<F, V> =>
      typeof detail.exportValue === "function",
    toModuleSpec = defaultFeatureModuleSpec,
    toExportName = defaultFeatureExportName,
    importModule = defaultImportModule,
    allowBinding,
    logBinding,
  } = options;

  return async (feature) => {
    if (!hasBindings(feature)) return { status: "static", feature };

    // Attempt to load all bindings concurrently
    const promises = feature.bindings.map(async (moduleBinding) => {
      const outcome = await loadBinding(feature, moduleBinding);
      if (logBinding) {
        await logBinding?.(outcome);
      }
      return outcome;
    });

    // Await the loaded bindings in order, returning the first, most specific binding that loads
    for (const featurePromise of promises) {
      const outcome = await featurePromise;
      if (outcome.status === "loaded") return outcome;
    }

    // Fall back to returning the unloaded feature
    return { status: "notFound", feature };
  };

  async function loadBinding(
    feature: F,
    moduleBinding: string[],
  ): Promise<FeatureOutcome<F, V>> {
    if (allowBinding && !await allowBinding(feature, moduleBinding)) {
      return { status: "ignored", feature, moduleBinding };
    }

    let moduleUrl: string | undefined = undefined;
    try {
      const moduleSpec = toModuleSpec(feature, moduleBinding);
      const url = new URL(import.meta.resolve(moduleSpec));
      const hash = url.hash.replace(/^#/, "");
      url.hash = "";
      moduleUrl = url.href;

      const mod = await importModule(url.href);

      if (mod) {
        const partialLoaded: Omit<
          FeatureLoaded<F, unknown>,
          "exportBinding" | "exportName" | "exportValue"
        > = {
          status: "loaded",
          feature,
          moduleUrl,
          moduleBinding,
        };

        if (hash) {
          // Look only for the export explicitly given in the hash
          const loaded: FeatureLoaded<F, unknown> = {
            ...partialLoaded,
            exportName: hash,
            exportValue: mod[hash],
          };
          if (isValidExport(loaded)) {
            return loaded;
          }
        } else {
          // Look for an export that matches a binding
          for (const exportBinding of feature.bindings!) {
            const exportName = toExportName(feature, exportBinding);
            const loaded: FeatureLoaded<F, unknown> = {
              ...partialLoaded,
              exportBinding,
              exportName,
              exportValue: mod[exportName],
            };
            if (isValidExport(loaded)) {
              return loaded;
            }
          }
          // Fallback to the default export if present
          const loaded: FeatureLoaded<F, unknown> = {
            ...partialLoaded,
            exportName: "default",
            exportValue: mod.default,
          };
          if (isValidExport(loaded)) {
            return loaded;
          }
        }
      }
    } catch {
      // ignore failure to load
    }
    return { status: "notFound", feature, moduleUrl, moduleBinding };
  }
}

function hasBindings<F extends Feature>(
  feature: F,
): feature is F & { bindings: string[][] } {
  return "bindings" in feature && !!feature.bindings &&
    !!feature.bindings.length;
}

const EXT = import.meta.url.slice(import.meta.url.lastIndexOf("."));

export function defaultFeatureModuleSpec(
  feature: Feature,
  binding: string[],
): string {
  return `@ahx/features/${feature.kind}/${binding.join("/")}${EXT}`;
}

export function defaultFeatureExportName(
  _feature: Feature,
  binding: string[],
): string {
  return binding.join("_");
}

export function defaultImportModule(
  url: string,
): Promise<Record<string, unknown>> {
  return import(url);
}
