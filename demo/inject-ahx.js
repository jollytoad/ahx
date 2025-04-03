(function () {
  if (location.hash === "#ts") {
    sessionStorage.setItem("ahx-demo-mode", "ts");
  } else if (location.hash === "#js") {
    sessionStorage.setItem("ahx-demo-mode", "js");
  }

  const ts = sessionStorage.getItem("ahx-demo-mode") === "ts";

  const importmap = {
    "imports": {
      "@ahx/": "/@ahx/",
      "@ahx/features/element/http/cat.js": "/examples/_http_cat.js",
      "@ahx/features/element/http/cat.ts": "/examples/_http_cat.js",
      "dompurify":
        "https://cdn.jsdelivr.net/gh/cure53/dompurify@3.2.4/dist/purify.es.mjs",
      "idiomorph":
        "https://cdn.jsdelivr.net/gh/bigskysoftware/idiomorph@0.7.3/dist/idiomorph.esm.js",
    },
  };

  if (ts) {
    console.debug("TypeScript mode");

    // Yeah, I know you're not meant to do this, but this is for the purpose of a hackable demo,
    // I don't recommend doing this on a production site!
    document.writeln(
      `<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>`,
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
    document.writeln(
      `<script type="module">import "@ahx/init/mod.js";</script>`,
    );
  }
})();
