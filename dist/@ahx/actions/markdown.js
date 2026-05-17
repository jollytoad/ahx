

export const markdown = async (...args) => {
  const micromark = await importMicromark();

  const options = {};

  const promises = [];
  for (const arg of args) {
    promises.push(importExtension(arg, options));
  }

  if (promises.length) {
    await Promise.all(promises);
  }

  return async ({ texts, response }) => {
    if (!texts && response) {
      texts = [await response.text()];
    }

    if (!texts) return;

    return {
      texts: texts.map((text) => micromark(text, options)),
      nodes: undefined,
    };
  };
};

async function importMicromark() {
  return (await import("micromark")).micromark;
}

async function importExtension(ext, options) {
  switch (ext) {
    case "gfm": {
      const { gfm, gfmHtml } = await import("micromark-extension-gfm");
      (options.extensions ??= [])?.push(gfm());
      (options.htmlExtensions ??= [])?.push(gfmHtml());
      break;
    }
    case "math": {
      const { math, mathHtml } = await import("micromark-extension-math");
      (options.extensions ??= [])?.push(math());
      (options.htmlExtensions ??= [])?.push(mathHtml());
      break;
    }
    default:
      throw new TypeError(
        `Invalid markdown extension: "${ext}", may be one of: gfm, math`,
      );
  }
}
