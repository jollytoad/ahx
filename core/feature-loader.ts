import type {
  Feature,
  FeatureInit,
  FeatureLoaded,
  FeatureLoader,
  FeatureLoaderOptions,
} from "@ahx/types";

export function createFeatureLoader<
  F extends Feature = Feature,
  V = FeatureInit,
>(options?: FeatureLoaderOptions<F, V>): FeatureLoader<F, V> {

  const options_ = {
    isValidExport: (detail: FeatureLoaded<F, unknown>): detail is FeatureLoaded<F, V> =>
      typeof detail.exportValue === "function",
    toModuleSpec: defaultFeatureModuleSpec,
    toExportName: defaultFeatureExportName,
    importModule: defaultImportModule,
    ...options
  }

  return async (feature) => {
    if (!hasBindings(feature)) return { feature };

    // Attempt to load all bindings concurrently
    const promises = feature.bindings.map(moduleBinding => loadBinding(feature, moduleBinding, options_));

    // Await the loaded bindings in order, returning the first, most specific binding that loads
    for (const featurePromise of promises) {
      const loadedFeature = await featurePromise
      if ('exportValue' in loadedFeature) {
        // TODO: record binding
        return loadedFeature
      } else {
        // TODO: record non-binding
        console.warn('Feature not found', loadedFeature)
      }
    }

    // Fall back to returning the unloaded feature
    return { feature };
  };
}

function hasBindings<F extends Feature>(feature: F): feature is F & { bindings: string[][] } {
  return "bindings" in feature && !!feature.bindings && !!feature.bindings.length
}

async function loadBinding<
  F extends Feature = Feature,
  V = FeatureInit,
>(feature: F, moduleBinding: string[], { toModuleSpec, importModule, isValidExport, toExportName }: Required<FeatureLoaderOptions<F, V>>) {
  let moduleUrl: string | undefined = undefined;
  try {
    const moduleSpec = toModuleSpec(feature, moduleBinding);
    const url = new URL(import.meta.resolve(moduleSpec));
    const hash = url.hash.replace(/^#/, "");
    url.hash = "";
    moduleUrl = url.href;

    const mod = await importModule(url.href);

    if (mod) {
      if (hash) {
        // Look only for the export explicitly given in the hash
        const exportName = hash;
        const exportValue = mod[exportName];
        const loaded = {
          feature,
          moduleUrl,
          moduleBinding,
          exportName,
          exportValue,
        };
        if (isValidExport(loaded)) {
          return loaded;
        }
      } else {
        // Look for an export that matches a binding
        for (const exportBinding of feature.bindings!) {
          const exportName = toExportName(feature, exportBinding);
          const exportValue = mod[exportName];
          const loaded = {
            feature,
            moduleUrl,
            moduleBinding,
            exportBinding,
            exportName,
            exportValue,
          };
          if (isValidExport(loaded)) {
            return loaded;
          }
        }
        // Fallback to the default export if present
        const exportName = "default";
        const exportValue = mod[exportName];
        const loaded = {
          feature,
          moduleUrl,
          moduleBinding,
          exportName,
          exportValue,
        };
        if (isValidExport(loaded)) {
          return loaded;
        }
      }
    }
  } catch {
    // ignore failure to load
  }
  return { feature, moduleUrl, moduleBinding };
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
