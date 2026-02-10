(function () {
  const flags = location.hash.replace(/^#/, "").split(",");
  for (const flag of flags) {
    switch (flag) {
      case "ts":
      case "js":
        sessionStorage.setItem("ahx-demo-mode", flag);
        break;
      case "binding-cache":
      case "binding-list":
      case "binding-all":
        sessionStorage.setItem("ahx-binding-mode", flag);
        break;
    }
  }

  const ts = sessionStorage.getItem("ahx-demo-mode") === "ts";
  const bindingMode = sessionStorage.getItem("ahx-binding-mode") ??
    "binding-all";

  const ext = ts ? 'ts' : 'js';

  const importmap = {
    "imports": {
      "@ahx/": "/@ahx/",
      [`@ahx/features/element/http/cat.${ext}`]: `/examples/_http_cat.${ext}`,
      "dompurify":
        "https://cdn.jsdelivr.net/gh/cure53/dompurify@3.3.1/dist/purify.es.mjs",
      "idiomorph":
        "https://cdn.jsdelivr.net/gh/bigskysoftware/idiomorph@0.7.4/dist/idiomorph.esm.js",
    },
  };

  switch (bindingMode) {
    case "binding-all":
      importmap.imports[`@ahx/custom/filter.${ext}`] =
        `/@ahx/custom/filter-all.${ext}`;
      break;
    case "binding-list":
      importmap.imports[`@ahx/custom/filter.${ext}`] =
        `/@ahx/custom/filter-list.${ext}`;
      break;
    case "binding-cache":
      importmap.imports[`@ahx/custom/filter.${ext}`] =
        `/@ahx/custom/filter-list.${ext}`;
      importmap.imports[`@ahx/custom/log/binding.${ext}`] =
        `/@ahx/custom/log/binding-cache.${ext}`;
      break;
  }

  console.debug("Binding mode:", bindingMode);

  const preloads = [
    "/@ahx/actions/attr",
    "/@ahx/actions/get",
    "/@ahx/actions/swap",
    "/@ahx/actions/target",
    "/@ahx/common/controls",
    "/@ahx/common/extended-selector",
    "/@ahx/common/fetch-action",
    "/@ahx/common/form-details",
    "/@ahx/common/guards",
    "/@ahx/common/potential-bindings",
    "/@ahx/common/swap",
    "/@ahx/core/action-event",
    "/@ahx/core/action",
    "/@ahx/core/ahx-event",
    "/@ahx/core/control",
    "/@ahx/core/exec-pipeline",
    "/@ahx/core/feature-finder",
    "/@ahx/core/feature-loader",
    "/@ahx/core/init-features",
    "/@ahx/core/parse-pipeline",
    "/@ahx/core/start-dom-observer",
    "/@ahx/core/start",
    "/@ahx/core/update-control",
    "/@ahx/custom/config-default",
    "/@ahx/custom/config",
    "/@ahx/custom/detectors",
    "/@ahx/custom/log/config",
    "/@ahx/custom/log/error",
    "/@ahx/custom/log/event",
    "/@ahx/custom/log/feature",
    "/@ahx/custom/log/pipeline",
    "/@ahx/detectors/ahx-ignore",
    "/@ahx/detectors/custom-attr",
    "/@ahx/detectors/custom-css-property",
    "/@ahx/detectors/custom-element",
    "/@ahx/detectors/mutation-record",
    "/@ahx/detectors/observe-html",
    "/@ahx/detectors/observe-shadow-root",
    "/@ahx/detectors/recurse-css-rules",
    "/@ahx/detectors/recurse-document",
    "/@ahx/detectors/recurse-element",
    "/@ahx/detectors/recurse-feature",
    "/@ahx/detectors/recurse-shadow-root",
    "/@ahx/features/attr/on",
    "/@ahx/features/cssprop/on",
    "/@ahx/features/observe/html",
    "/@ahx/init/mod",
  ];

  if (ts) {
    console.debug("TypeScript mode");

    // Yeah, I know you're not meant to do this, but this is for the purpose of a hackable demo,
    // I don't recommend doing this on a production site!
    document.writeln(
      `<script async src="https://ga.jspm.io/npm:es-module-shims@2.8.0/dist/es-module-shims.js"></script>`,
    );
    document.writeln(
      `<script type="importmap-shim">${JSON.stringify(importmap)}</script>`,
    );
    document.writeln(
      `<script type="module-shim">import "@ahx/init/mod.ts";</script>`,
    );
  } else {
    console.debug("JavaScript mode");

    document.writeln(
      `<script type="importmap">${JSON.stringify(importmap)}</script>`,
    );
    for (const href of preloads) {
      document.writeln(`<link rel="modulepreload" href="${href}.js">`);
    }
    document.writeln(
      `<script type="module">import "@ahx/init/mod.js";</script>`,
    );
  }

  document.writeln(
    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/missing.css@1.2.0/dist/missing.min.css" ahx-ignore>`,
  );
})();
