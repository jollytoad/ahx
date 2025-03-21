import type { ActionConstruct, ActionResult } from "@ahx/types";
import { HTMLBodyElementParserStream } from "@ahx/common/html-body-element-parser-stream.ts";

export const stream: ActionConstruct = () => {
  return ({ targets, response, signal }): ActionResult | undefined => {
    if (!targets || !response?.body) return;

    const nodes = response.body
      .pipeThrough(new TextDecoderStream(), { signal })
      .pipeThrough(new HTMLBodyElementParserStream(document, true), { signal });

    return { nodes };
  };
};
