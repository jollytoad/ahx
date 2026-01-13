(function () {
  if (location.hash === "#ts") {
    sessionStorage.setItem("ahx-demo-mode", "ts");
  } else if (location.hash === "#js") {
    sessionStorage.setItem("ahx-demo-mode", "js");
  }

  const ts = sessionStorage.getItem("ahx-demo-mode") === "ts";
  const ext = ts ? 'ts' : 'js';

  const importmap = {
    "imports": {
//      "@ahx/": "/@ahx/",
      "@ahx/init/": "/@ahx/init/",
      "@ahx/core/": "/@ahx/core/",
      "@ahx/custom/": "/@ahx/custom/",
      "@ahx/detectors/": "/@ahx/detectors/",
      "@ahx/common/": "/@ahx/common/",
      "@ahx/actions/": "/@ahx/actions/",
      "@ahx/features/observe/": "/@ahx/features/observe/",
      [`@ahx/features/attr/on.${ext}`]: `/@ahx/features/attr/on.${ext}`,
      [`@ahx/features/cssprop/on.${ext}`]: `/@ahx/features/cssprop/on.${ext}`,
      [`@ahx/features/element/http/cat.${ext}`]: `/examples/_http_cat.${ext}`,
      "dompurify":
        "https://cdn.jsdelivr.net/gh/cure53/dompurify@3.2.4/dist/purify.es.mjs",
      "idiomorph":
        "https://cdn.jsdelivr.net/gh/bigskysoftware/idiomorph@0.7.3/dist/idiomorph.esm.js",
    },
  };

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
      `<script async src="https://ga.jspm.io/npm:es-module-shims@2.6.2/dist/es-module-shims.js"></script>`,
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
