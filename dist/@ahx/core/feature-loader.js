

export function createFeatureLoader(options) {
  const options_ = {
    isValidExport: (
      detail,
    ) =>
      typeof detail.exportValue === "function",
    toModuleSpec: defaultFeatureModuleSpec,
    toExportName: defaultFeatureExportName,
    importModule: defaultImportModule,
    ...options,
  };

  return async (feature) => {
    if (!hasBindings(feature)) return { feature };

        const promises = feature.bindings.map((moduleBinding) =>
      loadBinding(feature, moduleBinding, options_)
    );

        for (const featurePromise of promises) {
      const loadedFeature = await featurePromise;
      if ("exportValue" in loadedFeature) {
                return loadedFeature;
      } else {
                console.warn("Feature not found", loadedFeature);
      }
    }

        return { feature };
  };
}

function hasBindings(
  feature,
) {
  return "bindings" in feature && !!feature.bindings &&
    !!feature.bindings.length;
}

async function loadBinding(
  feature,
  moduleBinding,
  { toModuleSpec, importModule, isValidExport, toExportName },
) {
  let moduleUrl = undefined;
  try {
    const moduleSpec = toModuleSpec(feature, moduleBinding);
    const url = new URL(import.meta.resolve(moduleSpec));
    const hash = url.hash.replace(/^#/, "");
    url.hash = "";
    moduleUrl = url.href;

    const mod = await importModule(url.href);

    if (mod) {
      if (hash) {
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
                for (const exportBinding of feature.bindings) {
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
  feature,
  binding,
) {
  return `@ahx/features/${feature.kind}/${binding.join("/")}${EXT}`;
}

export function defaultFeatureExportName(
  _feature,
  binding,
) {
  return binding.join("_");
}

export function defaultImportModule(
  url,
) {
  return import(url);
}
