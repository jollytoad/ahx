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
>({
  isValidExport = (detail): detail is FeatureLoaded<F, V> =>
    typeof detail.exportValue === "function",
  toModuleSpec = defaultFeatureModuleSpec,
  toExportName = defaultFeatureExportName,
  importModule = defaultImportModule,
}: FeatureLoaderOptions<F, V> = {}): FeatureLoader<F, V> {
  return async (feature) => {
    if (
      !("bindings" in feature && feature.bindings && feature.bindings.length)
    ) return { feature };

    for (const moduleBinding of feature.bindings!) {
      let mod: Record<string, unknown> | undefined;
      let moduleUrl: string;
      let hash: string | undefined;

      try {
        const moduleSpec = toModuleSpec(feature, moduleBinding);
        const url = new URL(import.meta.resolve(moduleSpec));
        hash = url.hash.replace(/^#/, "");
        url.hash = "";
        moduleUrl = url.href;

        mod = await importModule(moduleUrl);
      } catch {
        // ignore and try next module
        continue;
      }

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
    }

    return { feature };
  };
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
