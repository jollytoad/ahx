

export function createFeatureLoader(
  options = {},
) {
  const {
    isValidExport = (detail) =>
      typeof detail.exportValue === "function",
    toModuleSpec = defaultFeatureModuleSpec,
    toExportName = defaultFeatureExportName,
    importModule = defaultImportModule,
    allowBinding,
    logBinding,
  } = options;

  return async (feature) => {
    if (!hasBindings(feature)) return { status: "static", feature };

        const promises = feature.bindings.map(async (moduleBinding) => {
      const outcome = await loadBinding(feature, moduleBinding);
      if (logBinding) {
        await logBinding?.(outcome);
      }
      return outcome;
    });

        for (const featurePromise of promises) {
      const outcome = await featurePromise;
      if (outcome.status === "loaded") return outcome;
    }

        return { status: "notFound", feature };
  };

  async function loadBinding(
    feature,
    moduleBinding,
  ) {
    if (allowBinding && !await allowBinding(feature, moduleBinding)) {
      return { status: "ignored", feature, moduleBinding };
    }

    let moduleUrl = undefined;
    try {
      const moduleSpec = toModuleSpec(feature, moduleBinding);
      const url = new URL(import.meta.resolve(moduleSpec));
      const hash = url.hash.replace(/^#/, "");
      url.hash = "";
      moduleUrl = url.href;

      const mod = await importModule(url.href);

      if (mod) {
        const partialLoaded = {
          status: "loaded",
          feature,
          moduleUrl,
          moduleBinding,
        };

        if (hash) {
                    const loaded = {
            ...partialLoaded,
            exportName: hash,
            exportValue: mod[hash],
          };
          if (isValidExport(loaded)) {
            return loaded;
          }
        } else {
                    for (const exportBinding of feature.bindings) {
            const exportName = toExportName(feature, exportBinding);
            const loaded = {
              ...partialLoaded,
              exportBinding,
              exportName,
              exportValue: mod[exportName],
            };
            if (isValidExport(loaded)) {
              return loaded;
            }
          }
                    const loaded = {
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

function hasBindings(
  feature,
) {
  return "bindings" in feature && !!feature.bindings &&
    !!feature.bindings.length;
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
