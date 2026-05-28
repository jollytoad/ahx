(async () => {
  await importExt("@ahx/init/shim.js");

  const { initFeatures } = await importExt("@ahx/core/init-features.js");

  const sheet = await importExt("init.css", "css");

  await initFeatures(document, [sheet, "ready"]);
})();

async function importExt(mod, type) {
  const url = browser.runtime.getURL(`./${mod}`);
  if (!type) {
    return import(url);
  } else if (type === "css") {
    const sheet = new CSSStyleSheet();
    const text = await (await fetch(url)).text();
    sheet.replaceSync(text);
    return sheet;
  }
}
