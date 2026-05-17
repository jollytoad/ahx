import type { ActionConstruct, ActionResult } from "@ahx/types";
import type { micromark, Options } from "micromark";

export const markdown: ActionConstruct = async (...args) => {
  const micromark = await importMicromark();

  const options: Options = {};

  const promises: Promise<void>[] = [];
  for (const arg of args) {
    promises.push(importExtension(arg, options));
  }

  if (promises.length) {
    await Promise.all(promises);
  }

  return async ({ texts, response }): Promise<ActionResult | undefined> => {
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

async function importMicromark(): Promise<typeof micromark> {
  return (await import("micromark")).micromark;
}

async function importExtension(ext: string, options: Options) {
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
